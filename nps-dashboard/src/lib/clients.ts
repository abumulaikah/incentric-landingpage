import type { ClientConfig, StageDef } from './config';
import { CLIENTS as CODE_CLIENTS, getClient as getCodeClient } from './config';
import { ensureSchema, getQuery } from './db';

export interface ClientRecord extends ClientConfig {
  id: number;
  passwordHash: string | null;
  isActive: boolean;
}

export interface StageRecord {
  key: string;
  label: string;
}

export interface QuestionMapRecord {
  questionId: string;
  questionTitle: string;
  label: string;
  stageKey: string | null;
  isScore: boolean;
  position: number;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

let schemaReady = false;

async function ready() {
  if (schemaReady) return getQuery();
  const ok = await ensureSchema();
  schemaReady = ok;
  return ok ? getQuery() : null;
}

/** Semua client aktif; kalau database kosong, pakai daftar di kode. */
export async function listClients(): Promise<ClientRecord[]> {
  const query = await ready();
  if (!query) return CODE_CLIENTS.map(fromCode);

  const { rows } = await query(
    `SELECT id, slug, name, short_name, tally_form_id, nps_scale, password_hash, is_active
     FROM nps_client WHERE is_active = TRUE ORDER BY name`,
  );

  return rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    shortName: row.short_name ? String(row.short_name) : String(row.name),
    formId: String(row.tally_form_id),
    npsScale: String(row.nps_scale) === '0-10' ? '0-10' : '1-5',
    npsTitle: `Recommendation for ${row.name}`,
    stageOrder: [],
    showInpatientRoom: true,
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    isActive: Boolean(row.is_active),
  }));
}

export async function getClientRecord(slug: string): Promise<ClientRecord | null> {
  const normalized = slug.trim().toLowerCase();

  const query = await ready();
  if (query) {
    const { rows } = await query(
      `SELECT id, slug, name, short_name, tally_form_id, nps_scale, password_hash, is_active
       FROM nps_client WHERE slug = $1 AND is_active = TRUE`,
      [normalized],
    );
    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: Number(row.id),
        slug: String(row.slug),
        name: String(row.name),
        shortName: row.short_name ? String(row.short_name) : String(row.name),
        formId: String(row.tally_form_id),
        npsScale: String(row.nps_scale) === '0-10' ? '0-10' : '1-5',
        npsTitle: `Recommendation for ${row.name}`,
        stageOrder: [],
        showInpatientRoom: true,
        passwordHash: row.password_hash ? String(row.password_hash) : null,
        isActive: Boolean(row.is_active),
      };
    }
  }

  const codeClient = getCodeClient(normalized);
  return codeClient ? fromCode(codeClient) : null;
}

function fromCode(client: ClientConfig): ClientRecord {
  return { ...client, id: 0, passwordHash: null, isActive: true };
}

export async function listStages(clientId: number): Promise<StageRecord[]> {
  const query = await ready();
  if (!query || clientId === 0) return [];
  const { rows } = await query(
    `SELECT key, label FROM nps_stage WHERE client_id = $1 ORDER BY position, id`,
    [clientId],
  );
  return rows.map((row) => ({ key: String(row.key), label: String(row.label) }));
}

export async function listQuestionMap(clientId: number): Promise<QuestionMapRecord[]> {
  const query = await ready();
  if (!query || clientId === 0) return [];
  const { rows } = await query(
    `SELECT question_id, question_title, label, stage_key, is_score, position
     FROM nps_question_map WHERE client_id = $1 ORDER BY position, id`,
    [clientId],
  );
  return rows.map((row) => ({
    questionId: String(row.question_id),
    questionTitle: row.question_title ? String(row.question_title) : '',
    label: String(row.label),
    stageKey: row.stage_key ? String(row.stage_key) : null,
    isScore: Boolean(row.is_score),
    position: Number(row.position),
  }));
}

export interface CreateClientInput {
  slug?: string;
  name: string;
  formId: string;
  npsScale?: '1-5' | '0-10';
  passwordHash: string | null;
}

export async function createClient(input: CreateClientInput): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const query = await ready();
  if (!query) return { ok: false, error: 'Database belum terhubung (DATABASE_URL kosong).' };

  const slug = slugify(input.slug || input.name);
  if (!slug) return { ok: false, error: 'Slug tidak valid.' };
  if (!/^[A-Za-z0-9]{4,}$/.test(input.formId.trim())) {
    return { ok: false, error: 'Form ID Tally tidak valid.' };
  }

  try {
    await query(
      `INSERT INTO nps_client (slug, name, short_name, tally_form_id, nps_scale, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [slug, input.name.trim(), input.name.trim(), input.formId.trim(), input.npsScale ?? '1-5', input.passwordHash],
    );
    return { ok: true, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan client.';
    if (/duplicate key/i.test(message)) return { ok: false, error: 'Slug sudah dipakai client lain.' };
    return { ok: false, error: message };
  }
}

export async function updateClient(
  id: number,
  patch: { name?: string; formId?: string; npsScale?: '1-5' | '0-10'; passwordHash?: string | null },
): Promise<void> {
  const query = await ready();
  if (!query || id === 0) return;

  await query(
    `UPDATE nps_client SET
       name = COALESCE($2, name),
       short_name = COALESCE($2, short_name),
       tally_form_id = COALESCE($3, tally_form_id),
       nps_scale = COALESCE($4, nps_scale),
       password_hash = COALESCE($5, password_hash),
       updated_at = NOW()
     WHERE id = $1`,
    [id, patch.name ?? null, patch.formId ?? null, patch.npsScale ?? null, patch.passwordHash ?? null],
  );
}

/** Simpan tahap hasil sinkronisasi form. */
export async function replaceStages(clientId: number, stages: { key: string; label: string }[]): Promise<void> {
  const query = await ready();
  if (!query || clientId === 0) return;

  await query(`DELETE FROM nps_stage WHERE client_id = $1`, [clientId]);
  for (const [index, stage] of stages.entries()) {
    await query(`INSERT INTO nps_stage (client_id, key, label, position) VALUES ($1, $2, $3, $4)`, [
      clientId,
      stage.key,
      stage.label,
      index,
    ]);
  }
}

export async function upsertQuestionMaps(
  clientId: number,
  entries: { questionId: string; questionTitle: string; label: string; stageKey: string | null; isScore: boolean; position: number }[],
): Promise<void> {
  const query = await ready();
  if (!query || clientId === 0) return;

  for (const entry of entries) {
    await query(
      `INSERT INTO nps_question_map (client_id, question_id, question_title, label, stage_key, is_score, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (client_id, question_id) DO UPDATE SET
         question_title = EXCLUDED.question_title,
         label = EXCLUDED.label,
         stage_key = EXCLUDED.stage_key,
         is_score = EXCLUDED.is_score,
         position = EXCLUDED.position,
         updated_at = NOW()`,
      [clientId, entry.questionId, entry.questionTitle, entry.label, entry.stageKey, entry.isScore, entry.position],
    );
  }
}

/** Ubah mapping satu pertanyaan (dari halaman admin). */
export async function updateQuestionMap(
  clientId: number,
  questionId: string,
  patch: { label?: string; stageKey?: string | null },
): Promise<void> {
  const query = await ready();
  if (!query || clientId === 0) return;

  await query(
    `UPDATE nps_question_map SET
       label = COALESCE($3, label),
       stage_key = $4,
       updated_at = NOW()
     WHERE client_id = $1 AND question_id = $2`,
    [clientId, questionId, patch.label ?? null, patch.stageKey ?? null],
  );
}

/** Bangun StageDef dari tabel tahap + mapping pertanyaan. */
export function stagesFromRecords(stages: StageRecord[], maps: QuestionMapRecord[]): StageDef[] {
  return stages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    shortLabel: stage.label.length > 16 ? `${stage.label.slice(0, 15)}…` : stage.label,
    questions: maps.filter((map) => map.stageKey === stage.key && map.isScore).map((map) => map.questionId),
  }));
}
