/** Util pembacaan environment yang aman untuk dev maupun Vercel. */

export function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess) return fromProcess;

  try {
    const fromImport = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
    if (fromImport) return fromImport;
  } catch {
    // import.meta.env tidak tersedia (mis. saat dijalankan di luar Vite).
  }

  return undefined;
}

export function isDemoMode(): boolean {
  return readEnv('NPS_DEMO') === '1' || readEnv('NPS_DEMO') === 'true';
}

export function clientPassword(slug: string): string | undefined {
  return readEnv(`NPS_PASSWORD_${slug.toUpperCase()}`);
}

export function clientFormId(slug: string, fallback: string): string {
  return readEnv(`NPS_FORM_${slug.toUpperCase()}`) || fallback;
}

export function adminPassword(): string | undefined {
  return readEnv('ADMIN_PASSWORD');
}

export function authSecret(): string {
  return readEnv('AUTH_SECRET') || 'incentric-dev-secret-change-me';
}

export function cacheTtlSeconds(): number {
  const raw = Number(readEnv('NPS_CACHE_TTL_SECONDS'));
  return Number.isFinite(raw) && raw >= 0 ? raw : 300;
}
