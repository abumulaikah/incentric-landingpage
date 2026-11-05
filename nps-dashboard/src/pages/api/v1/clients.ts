import type { APIRoute } from 'astro';
import { assertClientScope, guard, isResponse, json } from '../../../lib/api';
import { loadDashboard } from '../../../lib/data';
import { resolveAllClients } from '../../../lib/resolve-client';

export const prerender = false;

/** GET /api/v1/clients â€” daftar client yang boleh diakses key ini. */
export const GET: APIRoute = async ({ request }) => {
  const auth = await guard(request);
  if (isResponse(auth)) return auth;

  const clients = await resolveAllClients();
  const allowed = clients.filter((item) => !auth.key.slug || item.client.slug === auth.key.slug);

  const payload = [];
  for (const item of allowed) {
    const loaded = await loadDashboard(item.client.slug);
    payload.push({
      slug: item.client.slug,
      name: item.client.name,
      npsScale: item.client.npsScale,
      responses: loaded?.data.nps?.total ?? 0,
      nps: loaded?.data.nps?.score ?? null,
      lastUpdated: loaded?.data.meta.generatedAt ?? null,
    });
  }

  return json(
    {
      data: payload,
      meta: { scope: auth.key.slug ?? 'all', remainingQuota: auth.remaining },
    },
    200,
    { 'x-ratelimit-remaining': String(auth.remaining) },
  );
};

export { assertClientScope };
