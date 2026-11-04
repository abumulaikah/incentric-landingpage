import { adminPassword, authSecret, clientPassword } from './env';

const COOKIE_NAME = 'nps_session';
const SESSION_SECONDS = 60 * 60 * 12;

export interface Session {
  scopes: string[];
  expiresAt: number;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(authSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(scopes: string[]): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ scopes, expiresAt })));
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = await hmac(payload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Session;
    if (!Array.isArray(decoded.scopes) || typeof decoded.expiresAt !== 'number') return null;
    if (decoded.expiresAt * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export const sessionCookieName = COOKIE_NAME;

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: SESSION_SECONDS,
  };
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: sessionCookieOptions(true),
};

/** Di localhost (http) cookie tidak boleh secure, kalau tidak browser menolak. */
export function cookieOptionsFor(url: URL | string) {
  return sessionCookieOptions(new URL(url).protocol === 'https:');
}

/** Satu variabel bisa berisi beberapa password dipisah koma. */
function matchesConfigured(configured: string | undefined, input: string): boolean {
  if (!configured || !input) return false;
  return configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .some((candidate) => timingSafeEqual(candidate, input.trim()));
}

export function checkClientPassword(slug: string, input: string): boolean {
  return matchesConfigured(clientPassword(slug), input);
}

export function checkAdminPassword(input: string): boolean {
  return matchesConfigured(adminPassword(), input);
}

export function hasClientPassword(slug: string): boolean {
  return Boolean(clientPassword(slug));
}

export function hasAdminPassword(): boolean {
  return Boolean(adminPassword());
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) {
      try {
        result[name] = decodeURIComponent(value);
      } catch {
        result[name] = value;
      }
    }
  }
  return result;
}

/** Rate limit login per instance serverless (bukan pengganti proteksi di edge). */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(identifier: string, limit = 10, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = attempts.get(identifier);
  if (!entry || entry.resetAt < now) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

export function resetAttempts(identifier: string) {
  attempts.delete(identifier);
}

export function canViewScope(session: Session | null, scope: string): boolean {
  if (!session) return false;
  return session.scopes.includes('admin') || session.scopes.includes(scope);
}

export function isAdmin(session: Session | null): boolean {
  return Boolean(session?.scopes.includes('admin'));
}
