import type { APIRoute } from 'astro';
import { apiError, assertClientScope, guard, isResponse } from '../../../../../lib/api';
import { loadDashboard } from '../../../../../lib/data';
import { csvFileName, dashboardToCsv } from '../../../../../lib/csv-export';
import { resolveClient } from '../../../../../lib/resolve-client';

export const prerender = false;

/** GET /api/v1/nps/{slug}/export — unduh CSV (sama dengan tombol Export CSV). */
export const GET: APIRoute = async ({ request, params, url }) => {
  const auth = await guard(request);
  if (isResponse(auth)) return auth;

  const slug = params.slug ?? '';
  const denied = assertClientScope(auth.key, slug);
  if (denied) return denied;

  const client = await resolveClient(slug);
  if (!client) return apiError(404, 'client_not_found', `No client with slug "${slug}".`);

  const result = await loadDashboard(slug, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    service: url.searchParams.get('service'),
  });

  if (!result) return apiError(500, 'load_failed', 'Could not build the export.');

  return new Response(dashboardToCsv(result.data), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFileName(result.data)}"`,
      'cache-control': 'no-store',
      'x-ratelimit-remaining': String(auth.remaining),
    },
  });
};
