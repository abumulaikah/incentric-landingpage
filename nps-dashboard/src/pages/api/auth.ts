import type { APIRoute } from 'astro';
import {
  checkAdminPassword,
  createSessionToken,
  cookieOptionsFor,
  resetAttempts,
  sessionCookie,
  tooManyAttempts,
  verifySessionToken,
} from '../../lib/auth';
import { getClientRecord } from '../../lib/clients';
import { hasDatabase } from '../../lib/db';

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
    return json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' }, 429);
  }

  if (isAdminLogin) {
    if (!checkAdminPassword(password)) {
      return json({ ok: false, error: 'Incorrect admin password.' }, 401);
    }
    resetAttempts(identifier);
    const token = await createSessionToken(['admin']);
    cookies.set(sessionCookie.name, token, cookieOptionsFor(request.url));
    return json({ ok: true, redirect: '/admin' });
  }

  const record = hasDatabase() ? await getClientRecord(slug) : null;
  if (!record) return json({ ok: false, error: 'Unknown client code.' }, 404);

  const { verifyClientPassword } = await import('../../lib/auth');
  const valid = await verifyClientPassword(record.slug, password, record.passwordHash);
  if (!valid) return json({ ok: false, error: 'Incorrect password.' }, 401);

  resetAttempts(identifier);
  const token = await createSessionToken([record.slug]);
  cookies.set(sessionCookie.name, token, cookieOptionsFor(request.url));
  return json({ ok: true, redirect: `/${record.slug}` });
};

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(sessionCookie.name)?.value;
  const session = await verifySessionToken(token);
  if (!session) return json({ ok: false }, 401);
  return json({ ok: true, scopes: session.scopes });
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(sessionCookie.name, { path: '/' });
  return json({ ok: true });
};
