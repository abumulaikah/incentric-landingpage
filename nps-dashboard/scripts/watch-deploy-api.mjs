/** Pantau status deployment sampai READY/ERROR. */
const env = Object.fromEntries(
  (await import('node:fs')).readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1).trim()];
    }),
);

const token = env.VERCEL_TOKEN;
const teamId = 'team_r5KqcKaTfYFIcWcI6JckvAW3';
const projectId = 'prj_dn5vAzwu7Nzh5EGL8Z6AdqNk90Xv';

async function call(pathname) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(`https://api.vercel.com${pathname}`, { headers: { Authorization: `Bearer ${token}` } });
      return await response.json();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error('network unavailable');
}

const latest = await call(`/v6/deployments?projectId=${projectId}&limit=1&teamId=${teamId}`);
const deployment = (latest.deployments || [])[0];
console.log('deployment:', deployment?.uid, deployment?.url);

for (let index = 0; index < 40; index++) {
  const detail = await call(`/v13/deployments/${deployment.uid}?teamId=${teamId}`);
  const state = detail.readyState || detail.state;
  console.log(new Date().toISOString().slice(11, 19), state);
  if (state === 'READY') {
    console.log('URL: https://' + detail.url);
    process.exit(0);
  }
  if (state === 'ERROR' || state === 'CANCELED') {
    console.log('ERROR:', String(detail.errorMessage || '').slice(0, 400));
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, 12000));
}
