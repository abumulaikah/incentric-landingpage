import type { APIRoute } from 'astro';
import { checkAdminPassword } from '../../lib/auth';
import { ensureSchema, getQuery } from '../../lib/db';

export const prerender = false;

/**
 * Buat tabel yang belum ada.
 * POST /api/setup?token=<ADMIN_PASSWORD>
 */
export const POST: APIRoute = async ({ url, request }) => {
  const token = url.searchParams.get('token') ?? request.headers.get('x-setup-token') ?? '';
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (expected && !expected.split(',').some((value) => value.trim() === token.trim())) {
    return new Response('Forbidden', { status: 403 });
  }
  void checkAdminPassword;

  try {
    const ok = await ensureSchema();
    if (!ok) return new Response(JSON.stringify({ ok: false, message: 'DATABASE_URL is not set.' }), { status: 500 });

    const query = await getQuery();
    const tables = await query!(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'nps_%' ORDER BY table_name`,
    );

    return new Response(JSON.stringify({ ok: true, tables: tables.rows.map((row) => String(row.table_name)) }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
