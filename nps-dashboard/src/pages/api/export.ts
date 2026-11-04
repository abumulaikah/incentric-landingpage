import type { APIRoute } from 'astro';
import { getClient } from '../../lib/config';
import { loadDashboard } from '../../lib/data';
import { dashboardToCsv, csvFileName } from '../../lib/csv-export';
import { isAdmin, sessionCookie, verifySessionToken } from '../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get('slug') ?? '';
  const client = getClient(slug);
  if (!client) return new Response('Client tidak ditemukan', { status: 404 });

  const session = await verifySessionToken(cookies.get(sessionCookie.name)?.value);
  const authorized = isAdmin(session) || session?.scopes.includes(client.slug);
  if (!authorized) return new Response('Tidak diizinkan', { status: 401 });

  const result = await loadDashboard(client.slug, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    service: url.searchParams.get('service'),
  });

  if (!result) return new Response('Gagal memuat data', { status: 500 });

  const csv = dashboardToCsv(result.data);
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFileName(result.data)}"`,
      'cache-control': 'no-store',
    },
  });
};
