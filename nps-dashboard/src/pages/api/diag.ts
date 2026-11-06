import type { APIRoute } from 'astro';
import { databaseDriver, databaseUrl, getQuery, hasDatabase } from '../../lib/db';

export const prerender = false;

/**
 * Diagnostik koneksi database.
 * Tidak menampilkan kredensial — hanya host, port, dan pesan error.
 * Lindungi dengan ADMIN_PASSWORD bila variabel itu ada.
 */
export const GET: APIRoute = async ({ url, request }) => {
  const token = url.searchParams.get('token') ?? request.headers.get('x-diag-token') ?? '';
  const expected = process.env.ADMIN_PASSWORD ?? '';

  if (expected && !expected.split(',').some((value) => value.trim() === token.trim())) {
    return new Response('Forbidden', { status: 403 });
  }

  const driver = databaseDriver();
  const raw = databaseUrl() ?? '';
  let host = '';
  let port = '';
  let user = '';
  let database = '';

  try {
    if (raw) {
      const parsed = new URL(raw.replace(/^postgres(ql)?:/, 'http:'));
      host = parsed.hostname;
      port = parsed.port;
      user = parsed.username;
      database = parsed.pathname.replace(/^\//, '');
    }
  } catch {
    host = '(connection string tidak bisa diparse)';
  }

  const result: Record<string, unknown> = {
    hasDatabaseUrl: hasDatabase(),
    driver,
    host,
    port,
    user,
    database,
    ssl: driver === 'pg' && !/localhost|127\.0\.0\.1/.test(raw) ? 'required' : 'off',
  };

  if (!hasDatabase()) {
    result.status = 'error';
    result.message = 'DATABASE_URL is not set';
    return new Response(JSON.stringify(result, null, 2), { headers: { 'content-type': 'application/json' } });
  }

  try {
    const query = await getQuery();
    if (!query) throw new Error('Connection unavailable');

    const ping = await query('SELECT NOW() AS now');
    result.status = 'connected';
    result.serverTime = ping.rows[0]?.now ?? null;

    const tables = await query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name LIKE 'nps_%'
       ORDER BY table_name`,
    );
    result.tables = tables.rows.map((row) => String(row.table_name));

    const counts: Record<string, number> = {};
    for (const table of result.tables as string[]) {
      const count = await query(`SELECT COUNT(*) AS total FROM ${table}`);
      counts[table] = Number(count.rows[0]?.total ?? 0);
    }
    result.rowCounts = counts;
  } catch (error) {
    result.status = 'error';
    result.message = error instanceof Error ? error.message : String(error);
    result.code = (error as { code?: string })?.code ?? null;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
