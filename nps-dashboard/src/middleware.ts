import { defineMiddleware } from 'astro:middleware';

/**
 * Pastikan semua respons HTML menyatakan charset UTF-8.
 * Tanpa ini, sebagian browser menebak encoding dan karakter seperti
 * en dash (�) atau titik tengah (�) bisa tampil rusak.
 */
export const onRequest = defineMiddleware(async (context, next) => {
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

  void context;
  return response;
});
