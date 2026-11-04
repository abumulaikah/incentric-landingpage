import type { APIRoute } from 'astro';
import {
  checkAdminPassword,
  checkClientPassword,
  cookieOptionsFor,
  createSessionToken,
  resetAttempts,
  sessionCookie,
  tooManyAttempts,
  verifySessionToken,
} from '../../lib/auth';
import { getClient } from '../../lib/config';
import { authSecret } from '../../lib/env';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  const contentType = request.headers.get('content-type') ?? '';
  let slug = '';
  let password = '';
  let scope = '';

  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    slug = String(body.slug ?? '');
    password = String(body.password ?? '');
    scope = String(body.scope ?? '');
  } else {
    const form = await request.formData();
    slug = String(form.get('slug') ?? '');
    password = String(form.get('password') ?? '');
    scope = String(form.get('scope') ?? '');
  }

  const isAdminLogin = scope === 'admin' || slug === 'admin';
  const identifier = `${isAdminLogin ? 'admin' : slug}:${request.headers.get('x-forwarded-for') ?? 'local'}`;

  if (tooManyAttempts(identifier)) {
    return json({ ok: false, error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' }, 429);
  }

  if (isAdminLogin) {
    if (!checkAdminPassword(password)) {
      return json({ ok: false, error: 'Kata sandi admin salah.' }, 401);
    }
    resetAttempts(identifier);
    const token = await createSessionToken(['admin']);
    cookies.set(sessionCookie.name, token, cookieOptionsFor(request.url));
    return json({ ok: true, redirect: '/admin' });
  }

  const client = getClient(slug);
  if (!client) return json({ ok: false, error: 'Kode klien tidak dikenali.' }, 404);

  if (!checkClientPassword(client.slug, password)) {
    return json({ ok: false, error: 'Kata sandi salah.' }, 401);
  }

  resetAttempts(identifier);
  const token = await createSessionToken([client.slug]);
  cookies.set(sessionCookie.name, token, cookieOptionsFor(request.url));
  return json({ ok: true, redirect: `/${client.slug}` });
};

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(sessionCookie.name)?.value;
  const session = await verifySessionToken(token);
  if (!session) return json({ ok: false }, 401);
  return json({ ok: true, scopes: session.scopes });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(sessionCookie.name, { path: '/' });
  void authSecret;
  return json({ ok: true });
};
