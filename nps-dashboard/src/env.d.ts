/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly TALLY_API_KEY: string;
  readonly AUTH_SECRET: string;
  readonly ADMIN_PASSWORD: string;
  readonly NPS_FORM_RSANANDA: string;
  readonly NPS_PASSWORD_RSANANDA: string;
  readonly NPS_DEMO: string;
  readonly NPS_CACHE_TTL_SECONDS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
