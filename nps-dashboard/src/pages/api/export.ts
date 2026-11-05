import type { APIRoute } from 'astro';
import { resolveClient } from '../../lib/resolve-client';
import { isAdmin, sessionCookie, verifySessionToken } from '../../lib/auth';
import { loadDashboard } from '../../lib/data';
import { dashboardToCsv, csvFileName } from '../../lib/csv-export';

export const prerender = false;

/** Export laporan ringkasan (NPS, tahap, korelasi, komentar). */
export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get('slug') ?? '';
  const resolved = await resolveClient(slug);
  if (!resolved) return new Response('Client not found', { status: 404 });
  const client = resolved.client;

  const session = await verifySessionToken(cookies.get(sessionCookie.name)?.value);
  const authorized = isAdmin(session) || session?.scopes.includes(client.slug);
  if (!authorized) return new Response('Not authorized', { status: 401 });

  const result = await loadDashboard(client.slug, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    service: url.searchParams.get('service'),
  });

  if (!result) return new Response('Failed to load data', { status: 500 });

  const csv = dashboardToCsv(result.data);
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFileName(result.data)}"`,
      'cache-control': 'no-store',
    },
  });
};
