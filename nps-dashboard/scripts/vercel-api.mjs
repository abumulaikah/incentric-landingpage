import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const TEAM = process.env.VERCEL_TEAM_ID || 'team_r5KqcKaTfYFIcWcI6JckvAW3';
const h = { Authorization: `Bearer ${env.VERCEL_TOKEN}`, 'Content-Type': 'application/json' };

async function call(method, path, body) {
  const response = await fetch(`https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${TEAM}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { status: response.status, ok: response.ok, data };
}

export async function createProject(name) {
  const existing = await call('GET', `/v9/projects/${name}`);
  if (existing.status === 200) return { created: false, project: existing.data };

  const body = {
    name,
    framework: 'astro',
    rootDirectory: 'nps-dashboard',
    buildCommand: 'npm run build',
    installCommand: 'npm install',
    outputDirectory: null,
  };
  const created = await call('POST', '/v11/projects', body);
  if (!created.ok) throw new Error(`create project gagal: ${created.status} ${JSON.stringify(created.data).slice(0, 400)}`);
  return { created: true, project: created.data };
}

export async function setEnv(projectId, key, value) {
  const result = await call('POST', `/v10/projects/${projectId}/env?upsert=true`, {
    key,
    value,
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  });
  if (!result.ok) throw new Error(`set env ${key} gagal: ${result.status} ${JSON.stringify(result.data).slice(0, 300)}`);
  return true;
}

export async function addDomain(projectId, domain) {
  const result = await call('POST', `/v10/projects/${projectId}/domains`, { name: domain });
  return result;
}

export async function domainStatus(projectId, domain) {
  const result = await call('GET', `/v9/projects/${projectId}/domains/${domain}`);
  return result;
}

export { env, call };
