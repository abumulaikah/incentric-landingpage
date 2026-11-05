import type { APIRoute } from 'astro';
import { isAdmin, sessionCookie, verifySessionToken } from '../../../lib/auth';
import { loadAllClients } from '../../../lib/data';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const session = await verifySessionToken(cookies.get(sessionCookie.name)?.value);
  if (!isAdmin(session)) return new Response('Forbidden', { status: 403 });

  const clients = await loadAllClients();

  return new Response(
    JSON.stringify({
      clients: clients.map((client) => ({
        slug: client.slug,
        name: client.name,
        formId: client.formId,
        manage: client.manage,
        responses: client.data?.nps?.total ?? 0,
        nps: client.data?.nps?.score ?? null,
      })),
    }),
    { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
  );
};
