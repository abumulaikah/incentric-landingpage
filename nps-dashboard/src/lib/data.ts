import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CLIENTS, getClient, type StageDef } from './config';
import { cacheTtlSeconds, clientFormId, isDemoMode, readEnv } from './env';
import { buildStages, normalizeSubmissions, type FormBlock, type SubmissionRecord } from './normalize';
import { SAMPLE_COMMENTS } from './sample-comments';
import { buildDashboard, type DashboardData } from './stats';
import { fetchTallySubmissions, TallyError } from './tally';
import type { SurveyResponse } from './types';

export interface Filters {
  from?: string | null;
  to?: string | null;
  service?: string | null;
}

interface RawStore {
  responses: SurveyResponse[];
  totalSubmissions: number;
  source: 'tally' | 'fixture';
  /** Tahap layanan hasil pembacaan Heading form Tally. */
  stages: StageDef[];
  warning?: string;
}

interface CacheEntry extends RawStore {
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export interface LoadResult {
  data: DashboardData;
  error?: string;
}

export async function loadDashboard(slug: string, filters: Filters = {}): Promise<LoadResult | null> {
  const client = getClient(slug);
  if (!client) return null;

  const raw = await getRaw(client.slug, client.formId);
  const service = filters.service?.trim() || null;
  const from = filters.from?.trim() || null;
  const to = filters.to?.trim() || null;

  const filtered = raw.responses.filter((response) => {
    if (service && response.serviceType !== service) return false;
    if (from && response.submittedAt.slice(0, 10) < from) return false;
    if (to && response.submittedAt.slice(0, 10) > to) return false;
    return true;
  });

  const data = buildDashboard({
    client,
    responses: filtered,
    source: raw.source,
    totalSubmissions: raw.totalSubmissions,
    filters: { from, to, service },
    availableServices: collectServices(raw.responses),
    stages: raw.stages,
    warning: raw.warning,
  });

  return { data, error: raw.warning };
}

async function getRaw(slug: string, fallbackFormId: string): Promise<RawStore> {
  const demo = isDemoMode();
  const key = `${slug}:${demo ? 'demo' : 'live'}`;
  const ttl = cacheTtlSeconds() * 1000;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit;

  const loaded = await loadRaw(slug, fallbackFormId, demo);
  cache.set(key, { ...loaded, expiresAt: Date.now() + ttl });
  return loaded;
}

async function loadRaw(slug: string, fallbackFormId: string, demo: boolean): Promise<RawStore> {
  const client = getClient(slug);
  if (!client) {
    return { responses: [], totalSubmissions: 0, source: 'fixture', stages: [], warning: 'Client tidak ditemukan.' };
  }

  if (demo) return loadFixture(slug);

  const apiKey = readEnv('TALLY_API_KEY');
  if (!apiKey) {
    return {
      responses: [],
      totalSubmissions: 0,
      source: 'tally',
      stages: [],
      warning:
        'TALLY_API_KEY belum diatur. Dashboard akan menampilkan data setelah API key Tally dipasang di environment Vercel.',
    };
  }

  const formId = clientFormId(slug, fallbackFormId);

  try {
    const { records, truncated, completedTotal, blueprint } = await fetchTallySubmissions(apiKey, formId);
    return buildRaw(records, client, truncated, completedTotal ?? undefined, blueprint);
  } catch (error) {
    const message =
      error instanceof TallyError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Gagal mengambil data Tally';

    // Jangan tampilkan cache lama seolah-olah data terbaru saat API gagal.
    return {
      responses: [],
      totalSubmissions: 0,
      source: 'tally',
      stages: [],
      warning: `Data Tally tidak dapat diambil: ${message}`,
    };
  }
}

function buildRaw(
  records: SubmissionRecord[],
  client: NonNullable<ReturnType<typeof getClient>>,
  truncated: boolean,
  completedTotal?: number,
  blueprint?: FormBlock[],
): RawStore {
  const { responses, unmappedTitles, scoreKeys } = normalizeSubmissions(records, client);
  const warnings: string[] = [];
  if (truncated) warnings.push('Sebagian submission tidak diambil karena melebihi batas halaman.');
  if (unmappedTitles.length > 0) {
    warnings.push(`Pertanyaan skor belum dipetakan: ${unmappedTitles.join('; ')}`);
  }

  return {
    responses,
    totalSubmissions: completedTotal ?? records.length,
    source: 'tally',
    stages: buildStages(blueprint, scoreKeys),
    warning: warnings.length ? warnings.join(' ') : undefined,
  };
}

export async function loadFixture(slug: string): Promise<RawStore> {
  const client = getClient(slug);
  if (!client) {
    return { responses: [], totalSubmissions: 0, source: 'fixture', stages: [], warning: 'Client tidak ditemukan.' };
  }

  try {
    const file = fileURLToPath(new URL(`../fixtures/${slug}.json`, import.meta.url));
    const text = await readFile(file, 'utf8');
    const records = JSON.parse(text) as SubmissionRecord[];
    const store = buildRaw(records, client, false);
    // Komentar contoh dipasang di record pertama hanya untuk pratinjau mode demo.
    if (store.responses[0]) {
      store.responses[0].comments = SAMPLE_COMMENTS.map((comment) => ({ ...comment }));
    }
    return { ...store, source: 'fixture' };
  } catch {
    return {
      responses: [],
      totalSubmissions: 0,
      source: 'fixture',
      stages: [],
      warning: 'Data demo belum tersedia. Jalankan npm run fixture terlebih dahulu.',
    };
  }
}

function collectServices(responses: SurveyResponse[]): string[] {
  return [...new Set(responses.map((response) => response.serviceType).filter(Boolean))].sort();
}

/** Ringkasan seluruh client untuk halaman admin. */
export async function loadAllClients() {
  const results = [];
  for (const client of CLIENTS) {
    const loaded = await loadDashboard(client.slug);
    results.push({
      slug: client.slug,
      name: client.name,
      shortName: client.shortName,
      formId: clientFormId(client.slug, client.formId),
      data: loaded?.data ?? null,
      error: loaded?.error,
    });
  }
  return results;
}

export { cache };
