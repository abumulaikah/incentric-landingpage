import type { APIRoute } from 'astro';
import { getQuery } from '../../lib/db';

export const prerender = false;

/**
 * Hapus client uji lewat admin.
 * POST /api/admin/delete-client?token=<ADMIN_PASSWORD>&slug=xxx
 */
export const POST: APIRoute = async ({ url, request }) => {
  const token = url.searchParams.get('token') ?? request.headers.get('x-setup-token') ?? '';
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (expected && !expected.split(',').some((value) => value.trim() === token.trim())) {
    return new Response('Forbidden', { status: 403 });
  }

  const slug = url.searchParams.get('slug') ?? '';
  if (!slug) return new Response('slug required', { status: 400 });

  const query = await getQuery();
  if (!query) return new Response('No database', { status: 500 });

  await query('DELETE FROM nps_client WHERE slug = $1', [slug]);
  return new Response(JSON.stringify({ ok: true, slug }), { headers: { 'content-type': 'application/json' } });
};
