import { createProject, setEnv, env, call } from './vercel-api.mjs';

const name = 'incentric-nps';
const { created, project } = await createProject(name);
console.log(`project ${name}: ${created ? 'dibuat' : 'sudah ada'} (id=${project.id})`);

const keys = [
  'TALLY_API_KEY',
  'AUTH_SECRET',
  'ADMIN_PASSWORD',
  'NPS_PASSWORD_RSANANDA',
  'NPS_FORM_RSANANDA',
  'NPS_CACHE_TTL_SECONDS',
  'NPS_DEMO',
];

for (const key of keys) {
  const value = env[key];
  if (!value) {
    console.log(`SKIP ${key} (tidak ada di .env)`);
    continue;
  }
  await setEnv(project.id, key, value);
  console.log(`env ${key}: ok`);
}

const detail = await call('GET', `/v9/projects/${project.id}`);
console.log(
  JSON.stringify(
    {
      name: detail.data.name,
      rootDirectory: detail.data.rootDirectory,
      framework: detail.data.framework,
      nodeVersion: detail.data.nodeVersion,
      buildCommand: detail.data.buildCommand,
      installCommand: detail.data.installCommand,
    },
    null,
    1,
  ),
);
