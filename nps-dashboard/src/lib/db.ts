import { readEnv } from './env';

/**
 * Akses Postgres (Neon, lewat integrasi Vercel Marketplace).
 * Tanpa DATABASE_URL, aplikasi tetap berjalan memakai konfigurasi di kode.
 */

type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

let cached: QueryFn | null = null;

export function databaseUrl(): string | undefined {
  return (
    readEnv('DATABASE_URL') ||
    readEnv('POSTGRES_URL') ||
    readEnv('DATABASE_URL_UNPOOLED') ||
    readEnv('POSTGRES_URL_NON_POOLING')
  );
}

export function hasDatabase(): boolean {
  return Boolean(databaseUrl());
}

export async function getQuery(): Promise<QueryFn | null> {
  if (!hasDatabase()) return null;
  if (cached) return cached;

  const url = databaseUrl() as string;
  if (/localhost|127\.0\.0\.1/.test(url)) {
    const pg = await import('pg');
    const pool = new pg.default.Pool({ connectionString: url, max: 3 });
    cached = async (text, params) => {
      const result = await pool.query(text, params as unknown[]);
      return { rows: result.rows as Record<string, unknown>[] };
    };
    return cached;
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  cached = async (text, params) => {
    // neon() menerima SQL teks + parameter; dinamai ulang agar tidak salah tipe.
    const run = sql as unknown as (query: string, values: unknown[]) => Promise<Record<string, unknown>[]>;
    const rows = await run(text, params ?? []);
    return { rows };
  };
  return cached;
}

/** Jalankan skema bila belum ada (idempotent). */
export async function ensureSchema(): Promise<boolean> {
  const query = await getQuery();
  if (!query) return false;

  await query(`
    CREATE TABLE IF NOT EXISTS nps_client (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      short_name TEXT,
      tally_form_id TEXT NOT NULL,
      nps_scale TEXT NOT NULL DEFAULT '1-5',
      password_hash TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS nps_stage (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES nps_client(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      label TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      UNIQUE (client_id, key)
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS nps_question_map (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES nps_client(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL,
      question_title TEXT,
      label TEXT NOT NULL,
      stage_key TEXT,
      is_score BOOLEAN NOT NULL DEFAULT TRUE,
      position INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, question_id)
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS nps_api_key (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      slug TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ
    )`);

  return true;
}
