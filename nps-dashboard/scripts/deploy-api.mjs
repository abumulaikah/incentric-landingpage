/**
 * Deploy langsung lewat Vercel API (bypass CLI yang gagal membaca /v2/user
 * untuk token ber-scope team).
 *
 * Pakai: node scripts/deploy-api.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1).trim()];
    }),
);

const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
const teamId = 'team_r5KqcKaTfYFIcWcI6JckvAW3';
const projectId = 'prj_dn5vAzwu7Nzh5EGL8Z6AdqNk90Xv';
const projectName = 'incentric-nps';

if (!token) throw new Error('VERCEL_TOKEN tidak ada di .env');

const headers = { Authorization: `Bearer ${token}` };

async function api(pathname, init = {}) {
  const response = await fetch(`https://api.vercel.com${pathname}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${pathname} → ${response.status}: ${text.slice(0, 300)}`);
  return data;
}

function git(command) {
  return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
}

const sha = git('rev-parse HEAD');
const message = git('log -1 --pretty=%s');
const branch = git('rev-parse --abbrev-ref HEAD');

console.log('commit:', sha.slice(0, 7), message);

// Deploy dari akar repo agar Root Directory "nps-dashboard" tetap valid.
const projectDir = 'nps-dashboard';

async function detectRoot() {
  const { existsSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(scriptDir, '..', '..'),
    path.resolve(scriptDir, '..', '..', '..'),
    path.resolve(scriptDir, '..', '..', '..', '..'),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, projectDir, 'package.json'))) return candidate;
  }
  return candidates[0];
}

const root = await detectRoot();
console.log('akar repo:', root);

// 1. Unggah berkas project (hanya yang dibutuhkan build).
const IGNORED = new Set(['node_modules', '.astro', 'dist', '.vercel', '.git']);
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name) || entry.name === '.env') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(root);

console.log('berkas:', files.length);

const uploads = [];
for (const file of files) {
  const content = readFileSync(file);
  const sha1 = createHash('sha1').update(content).digest('hex');
  const size = content.byteLength;
  uploads.push({ file: path.relative(root, file).split(path.sep).join('/'), sha: sha1, size, content });
}

void projectDir;

// Unggah semua berkas ke storage Vercel lebih dulu.
console.log('mengunggah berkas…');
for (const upload of uploads) {
  const response = await fetch(`https://api.vercel.com/v2/files?teamId=${teamId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': upload.sha,
    },
    body: upload.content,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`upload ${upload.file} → ${response.status}: ${body.slice(0, 200)}`);
  }
}

const manifest = uploads.map(({ file, sha, size }) => ({ file, sha, size }));

const create = await api('/v13/deployments?teamId=' + teamId + '&forceNew=1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: projectName,
    project: projectId,
    target: 'production',
    projectSettings: {
      rootDirectory: projectDir,
      framework: 'astro',
      buildCommand: 'npm run build',
      installCommand: 'npm install',
      outputDirectory: null,
    },
    files: manifest,
    meta: {
      githubCommitSha: sha,
      githubCommitMessage: message,
      githubCommitRef: branch,
      githubCommitOrg: 'abumulaikah',
      githubCommitRepo: 'incentric-landingpage',
    },
  }),
});

const deploymentId = create.id || create.uid;
console.log('deployment:', deploymentId, create.url);
console.log('menunggu build…');

for (let index = 0; index < 40; index++) {
  let detail;
  try {
    detail = await api(`/v13/deployments/${deploymentId}?teamId=${teamId}`);
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 8000));
    continue;
  }
  const state = detail.readyState || detail.state;
  console.log(new Date().toISOString().slice(11, 19), state);
  if (state === 'READY') {
    console.log('URL:', `https://${detail.url}`);
    process.exit(0);
  }
  if (state === 'ERROR' || state === 'CANCELED') {
    console.log(JSON.stringify(detail.errorMessage || detail, null, 2).slice(0, 600));
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
