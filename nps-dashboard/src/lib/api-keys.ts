import { createHash, randomBytes } from 'node:crypto';
import { getQuery } from './db';

/**
 * API key untuk integrasi pihak ketiga.
 * Hanya hash SHA-256 yang disimpan; key asli ditampilkan sekali saat dibuat.
 */

export interface ApiKeyRecord {
  id: number;
  name: string;
  slug: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiKeyContext {
  id: number;
  name: string;
  /** Null berarti akses ke semua client. */
  slug: string | null;
}

const KEY_PREFIX = 'nps_live_';

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

export function generateApiKey(): string {
  return `${KEY_PREFIX}${randomBytes(24).toString('hex')}`;
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const query = await getQuery();
  if (!query) return [];

  const { rows } = await query(
    `SELECT id, name, slug, created_at, last_used_at
     FROM nps_api_key WHERE revoked_at IS NULL ORDER BY created_at DESC`,
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    slug: row.slug ? String(row.slug) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    lastUsedAt: row.last_used_at ? new Date(String(row.last_used_at)).toISOString() : null,
  }));
}

export async function createApiKey(name: string, slug: string | null): Promise<{ key: string } | null> {
  const query = await getQuery();
  if (!query) return null;

  const key = generateApiKey();
  await query(`INSERT INTO nps_api_key (name, key_hash, slug) VALUES ($1, $2, $3)`, [
    name.trim() || 'Untitled integration',
    hashApiKey(key),
    slug,
  ]);

  return { key };
}

export async function revokeApiKey(id: number): Promise<void> {
  const query = await getQuery();
  if (!query) return;
  await query(`UPDATE nps_api_key SET revoked_at = NOW() WHERE id = $1`, [id]);
}

/** Validasi header Authorization: Bearer nps_live_... */
export async function authenticateApiKey(request: Request): Promise<ApiKeyContext | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(nps_live_[a-f0-9]{48})$/i);
  if (!match) return null;

  const query = await getQuery();
  if (!query) return null;

  const { rows } = await query(
    `SELECT id, name, slug FROM nps_api_key
     WHERE key_hash = $1 AND revoked_at IS NULL LIMIT 1`,
    [hashApiKey(match[1].toLowerCase())],
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  void query(`UPDATE nps_api_key SET last_used_at = NOW() WHERE id = $1`, [Number(row.id)]).catch(() => undefined);

  return {
    id: Number(row.id),
    name: String(row.name),
    slug: row.slug ? String(row.slug) : null,
  };
}

/** Rate limit sederhana per instance serverless. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(keyId: number, limit = 60, windowMs = 60_000): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = buckets.get(String(keyId));

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(String(keyId), { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}
