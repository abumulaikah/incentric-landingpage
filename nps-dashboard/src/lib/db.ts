import { readEnv } from './env';

/**
 * Akses Postgres. Mendukung Neon (driver serverless) dan Postgres biasa
 * (Supabase, Prisma, dsb.) lewat driver `pg`.
 *
 * Tanpa DATABASE_URL, aplikasi tetap berjalan memakai konfigurasi di kode.
 *
 * Untuk Supabase: pakai connection string mode "Session pooler"
 * (port 5432 di host *.pooler.supabase.com) karena serverless Vercel
 * membuat banyak koneksi sementara.
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

/** Nama driver yang dipakai, untuk ditampilkan di halaman admin. */
export function databaseDriver(): 'none' | 'neon' | 'pg' {
  const url = databaseUrl();
  if (!url) return 'none';
  return isNeonUrl(url) ? 'neon' : 'pg';
}

function isNeonUrl(url: string): boolean {
  // Host Neon: *.neon.tech / *.neon.build. Supabase memakai *.supabase.com.
  return /\.neon\.(tech|build)/i.test(url);
}

export function normalizeConnectionString(url: string): string {
  let value = url.trim();

  // Supabase memberi contoh dengan placeholder [YOUR-PASSWORD].
  if (value.includes('[YOUR-PASSWORD]')) {
    const password = readEnv('SUPABASE_DB_PASSWORD');
    if (password) value = value.replace('[YOUR-PASSWORD]', encodeURIComponent(password));
  }

  return value;
}

export async function getQuery(): Promise<QueryFn | null> {
  if (!hasDatabase()) return null;
  if (cached) return cached;

  const url = normalizeConnectionString(databaseUrl() as string);

  if (!/localhost|127\.0\.0\.1/.test(url) && isNeonUrl(url)) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    cached = async (text, params) => {
      const run = sql as unknown as (query: string, values: unknown[]) => Promise<Record<string, unknown>[]>;
      const rows = await run(text, params ?? []);
      return { rows };
    };
    return cached;
  }

  const pg = await import('pg');
  const pool = new pg.default.Pool({
    connectionString: url,
    max: 3,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
  });

  cached = async (text, params) => {
    const result = await pool.query(text, params as unknown[]);
    return { rows: result.rows as Record<string, unknown>[] };
  };
  return cached;
}

/**
 * Skema uji koneksi: memastikan tabel inti ada dan bisa dibaca.
 * Dipakai halaman admin untuk menampilkan status database.
 */
export async function checkDatabase(): Promise<{ ok: boolean; driver: string; message: string }> {
  const driver = databaseDriver();
  if (driver === 'none') return { ok: false, driver, message: 'DATABASE_URL is not set.' };

  try {
    const query = await getQuery();
    if (!query) return { ok: false, driver, message: 'Connection is not available.' };
    const { rows } = await query('SELECT 1 AS ok');
    void rows;
    return { ok: true, driver, message: `Connected using ${driver === 'neon' ? 'Neon serverless driver' : 'pg pool'}.` };
  } catch (error) {
    return {
      ok: false,
      driver,
      message: error instanceof Error ? error.message : 'Connection failed.',
    };
  }
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

  await query(`
    CREATE TABLE IF NOT EXISTS nps_catalog (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      keywords TEXT NOT NULL,
      stage_hint TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS nps_submission (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES nps_client(id) ON DELETE CASCADE,
      submission_id TEXT NOT NULL,
      respondent_id TEXT,
      submitted_at TIMESTAMPTZ,
      is_completed BOOLEAN NOT NULL DEFAULT TRUE,
      payload JSONB NOT NULL,
      synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (client_id, submission_id)
    )`);

  await query('CREATE INDEX IF NOT EXISTS idx_nps_question_map_client ON nps_question_map (client_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_nps_stage_client ON nps_stage (client_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_nps_submission_client ON nps_submission (client_id, submitted_at)');

  return true;
}
