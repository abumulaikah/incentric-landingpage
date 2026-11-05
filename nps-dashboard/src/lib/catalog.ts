import { QUESTIONS } from './config';
import { getQuery, ensureSchema } from './db';

/** Katalog label: menambah kosakata pencocokan tanpa mengubah kode. */

export interface CatalogEntry {
  id: number;
  label: string;
  /** Daftar kata kunci dipisah koma. */
  keywords: string[];
  stageHint: string | null;
  createdAt: string;
}

let ready = false;

async function catalogQuery() {
  if (!ready) ready = await ensureSchema();
  return ready ? getQuery() : null;
}

export async function ensureCatalogTable(): Promise<boolean> {
  const query = await getQuery();
  if (!query) return false;

  await query(`
    CREATE TABLE IF NOT EXISTS nps_catalog (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      keywords TEXT NOT NULL,
      stage_hint TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

  return true;
}

/** Semua entri katalog: bawaan kode + tambahan admin. */
export async function loadCatalog(): Promise<{ label: string; titleKeywords: string[]; stageHint: string | null; custom: boolean }[]> {
  const builtIn = QUESTIONS.map((question) => ({
    label: question.label,
    titleKeywords: question.titleKeywords,
    stageHint: null as string | null,
    custom: false,
  }));

  await ensureCatalogTable();
  const query = await catalogQuery();
  if (!query) return builtIn;

  const { rows } = await query(`SELECT label, keywords, stage_hint FROM nps_catalog ORDER BY id`);

  const custom = rows.map((row) => ({
    label: String(row.label),
    titleKeywords: String(row.keywords)
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    stageHint: row.stage_hint ? String(row.stage_hint) : null,
    custom: true,
  }));

  return [...builtIn, ...custom];
}

export async function addCatalogEntry(input: {
  label: string;
  keywords: string;
  stageHint?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const label = input.label.trim();
  const keywords = input.keywords
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (!label) return { ok: false, error: 'Label is required.' };
  if (keywords.length === 0) return { ok: false, error: 'At least one keyword is required.' };

  const query = await catalogQuery();
  if (!query) return { ok: false, error: 'Database not connected.' };

  const { rows } = await query(`SELECT id FROM nps_catalog WHERE lower(label) = lower($1) LIMIT 1`, [label]);
  if (rows.length > 0) {
    await query(`UPDATE nps_catalog SET keywords = $2, stage_hint = $3 WHERE id = $1`, [
      Number(rows[0].id),
      keywords.join(', '),
      input.stageHint ?? null,
    ]);
    return { ok: true };
  }

  await query(`INSERT INTO nps_catalog (label, keywords, stage_hint) VALUES ($1, $2, $3)`, [
    label,
    keywords.join(', '),
    input.stageHint ?? null,
  ]);
  return { ok: true };
}

export async function deleteCatalogEntry(id: number): Promise<void> {
  const query = await catalogQuery();
  if (!query) return;
  await query(`DELETE FROM nps_catalog WHERE id = $1`, [id]);
}

export async function listCustomCatalog(): Promise<CatalogEntry[]> {
  await ensureCatalogTable();
  const query = await catalogQuery();
  if (!query) return [];

  const { rows } = await query(`SELECT id, label, keywords, stage_hint, created_at FROM nps_catalog ORDER BY id`);
  return rows.map((row) => ({
    id: Number(row.id),
    label: String(row.label),
    keywords: String(row.keywords).split(',').map((keyword) => keyword.trim()),
    stageHint: row.stage_hint ? String(row.stage_hint) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  }));
}
