import { defineMiddleware } from 'astro:middleware';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'Authorization, Content-Type',
  'access-control-max-age': '86400',
};

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  ...CORS_HEADERS,
};

/**
 * Middleware global:
 * 1. API v1 bersifat read-only (hanya GET/HEAD/OPTIONS).
 * 2. Respons HTML selalu menyatakan charset UTF-8.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isApi = pathname === '/api/v1' || pathname.startsWith('/api/v1/');

  if (isApi) {
    const method = context.request.method.toUpperCase();

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (method !== 'GET' && method !== 'HEAD') {
      return new Response(
        JSON.stringify(
          {
            error: {
              code: 'method_not_allowed',
              message: 'This API is read-only. Use GET to read data.',
            },
          },
          null,
          2,
        ),
        { status: 405, headers: { ...jsonHeaders, allow: 'GET, HEAD, OPTIONS' } },
      );
    }

    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('access-control-allow-origin', '*');
    headers.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
    headers.set('access-control-allow-headers', 'Authorization, Content-Type');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const response = await next();

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.startsWith('text/html') && !/charset=/i.test(contentType)) {
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
});
