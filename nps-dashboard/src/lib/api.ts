import { authenticateApiKey, rateLimit, type ApiKeyContext } from './api-keys';

/** Pembungkus respons JSON yang konsisten untuk API publik. */

export const API_VERSION = 'v1';

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-api-version': API_VERSION,
      ...headers,
    },
  });
}

export function apiError(status: number, code: string, message: string, extra: Record<string, unknown> = {}): Response {
  return json({ error: { code, message, ...extra } }, status);
}

export interface ApiGuard {
  key: ApiKeyContext;
  remaining: number;
}

/**
 * Cek API key + rate limit.
 * Mengembalikan Response error bila tidak lolos.
 */
export async function guard(request: Request): Promise<ApiGuard | Response> {
  const key = await authenticateApiKey(request);
  if (!key) {
    return apiError(401, 'unauthorized', 'Missing or invalid API key. Use: Authorization: Bearer nps_live_...');
  }

  const limit = rateLimit(key.id);
  if (!limit.allowed) {
    return json(
      { error: { code: 'rate_limited', message: 'Too many requests. Limit is 60 requests per minute.' } },
      429,
      { 'retry-after': String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) },
    );
  }

  return { key, remaining: limit.remaining };
}

export function isResponse(value: ApiGuard | Response): value is Response {
  return value instanceof Response;
}

/** Pastikan key hanya boleh membaca client yang diizinkan. */
export function assertClientScope(key: ApiKeyContext, slug: string): Response | null {
  if (key.slug && key.slug !== slug) {
    return apiError(403, 'forbidden', 'This API key is not allowed to read this client.');
  }
  return null;
}
