import { defineMiddleware } from 'astro:middleware';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'Authorization, Content-Type',
  'access-control-max-age': '86400',
};

/**
 * Middleware global:
 * 1. API v1 bersifat read-only (hanya GET/HEAD/OPTIONS).
 * 2. Respons HTML selalu menyatakan charset UTF-8.
 * 3. Error tak terduga ditampilkan sebagai halaman yang jelas, bukan 500 kosong.
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
        {
          status: 405,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            allow: 'GET, HEAD, OPTIONS',
            ...CORS_HEADERS,
          },
        },
      );
    }
  }

  let response: Response;
  try {
    response = await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    if (isApi) {
      return new Response(JSON.stringify({ error: { code: 'internal_error', message } }, null, 2), {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8', ...CORS_HEADERS },
      });
    }

    return new Response(errorPage(message, context.url.pathname), {
      status: 500,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (isApi) {
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

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function errorPage(message: string, path: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Something went wrong - Incentric</title>
  </head>
  <body style="margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a">
    <div style="max-width:720px;margin:12vh auto;padding:0 24px">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#014fcf">Dashboard</p>
      <h1 style="font-size:32px;margin:12px 0 8px">Something went wrong</h1>
      <p style="color:#475569;line-height:1.6">
        The page <code>${escapeHtml(path)}</code> could not be loaded. This is usually a database or
        API configuration issue.
      </p>
      <pre style="background:#020617;color:#e2e8f0;padding:16px;border-radius:8px;overflow:auto;font-size:12.5px">${escapeHtml(message)}</pre>
      <p style="margin-top:20px"><a href="/admin" style="color:#014fcf;font-weight:700">Back to admin</a></p>
    </div>
  </body>
</html>`;
}
