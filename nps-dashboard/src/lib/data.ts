import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { CLIENTS, type ClientConfig, type StageDef } from './config';
import { cacheTtlSeconds, clientFormId, isDemoMode, readEnv } from './env';
import { buildStages, normalizeSubmissions, type FormBlock, type MappingLookup, type SubmissionRecord } from './normalize';
import { resolveClient, resolveAllClients } from './resolve-client';
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
  const resolved = await resolveClient(slug);
  if (!resolved) return null;
  const client = resolved.client;

  const raw = await getRaw(client.slug, client.formId, resolved.mapping);
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
    stages: resolved.stages ?? raw.stages,
    questionLabels: resolved.mapping
      ? new Map([...resolved.mapping.entries()].map(([id, value]) => [value.key, value.label]))
      : undefined,
    warning: raw.warning,
  });

  return { data, error: raw.warning };
}

async function getRaw(slug: string, fallbackFormId: string, mapping: MappingLookup | null): Promise<RawStore> {
  const demo = isDemoMode();
  const key = `${slug}:${demo ? 'demo' : 'live'}`;
  const ttl = cacheTtlSeconds() * 1000;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit;

  const loaded = await loadRaw(slug, fallbackFormId, demo, mapping);
  cache.set(key, { ...loaded, expiresAt: Date.now() + ttl });
  return loaded;
}

async function loadRaw(
  slug: string,
  fallbackFormId: string,
  demo: boolean,
  mapping: MappingLookup | null,
): Promise<RawStore> {
  const resolved = await resolveClient(slug);
  if (!resolved) {
    return { responses: [], totalSubmissions: 0, source: 'fixture', stages: [], warning: 'Client tidak ditemukan.' };
  }
  const client = resolved.client;

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
    return buildRaw(records, client, truncated, completedTotal ?? undefined, blueprint, mapping);
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
  client: ClientConfig,
  truncated: boolean,
  completedTotal?: number,
  blueprint?: FormBlock[],
  mapping?: MappingLookup | null,
): RawStore {
  const { responses, unmappedTitles, scoreKeys } = normalizeSubmissions(records, client, mapping ?? undefined);
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
  const resolved = await resolveClient(slug);
  if (!resolved) {
    return { responses: [], totalSubmissions: 0, source: 'fixture', stages: [], warning: 'Client tidak ditemukan.' };
  }
  const client = resolved.client;

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

/** Ringkasan seluruh client untuk halaman admin (database + fallback kode). */
export async function loadAllClients() {
  const results = [];
  const resolved = await resolveAllClients();

  for (const item of resolved) {
    const loaded = await loadDashboard(item.client.slug);
    results.push({
      id: item.record.id,
      slug: item.client.slug,
      name: item.client.name,
      shortName: item.client.shortName,
      formId: clientFormId(item.client.slug, item.client.formId),
      manage: Boolean(item.record.id),
      data: loaded?.data ?? null,
      error: loaded?.error,
    });
  }

  return results;
}

export { cache };
