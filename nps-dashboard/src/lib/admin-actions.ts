import { QUESTIONS } from './config';
import { createClient, replaceStages, upsertQuestionMaps } from './clients';
import { hashPassword } from './password';
import { syncFormStructure } from './sync';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export interface QuestionDraft {
  questionId: string;
  label: string;
  stageKey: string | null;
  isScore: boolean;
  isNps: boolean;
  title: string;
}

export interface SyncPreview {
  name: string;
  formId: string;
  slug: string;
  stages: { key: string; label: string }[];
  questions: QuestionDraft[];
  unknownCount: number;
}

/** Validasi form ID Tally lalu baca strukturnya untuk pratinjau admin. */
export async function createSyncPreview(input: { name: string; formId: string }): Promise<SyncPreview> {
  const name = input.name.trim();
  const formId = input.formId.trim();

  if (!name) throw new Error('Client name is required.');
  if (!/^[A-Za-z0-9]{4,}$/.test(formId)) throw new Error('Tally form ID looks invalid.');

  const result = await syncFormStructure(process.env.TALLY_API_KEY ?? '', formId);

  return {
    name,
    formId,
    slug: slugify(name),
    stages: result.stages,
    questions: result.questions.map((question) => ({
      questionId: question.questionId,
      label: question.label,
      stageKey: question.stageKey,
      isScore: question.isScore,
      isNps: question.isNps,
      title: question.title,
    })),
    unknownCount: result.unknownCount,
  };
}

export interface SyncCommitInput extends SyncPreview {
  password: string;
  npsScale: '1-5' | '0-10';
}

/** Simpan client + tahap + mapping pertanyaan ke database. */
export async function commitSync(input: SyncCommitInput): Promise<{ ok: boolean; slug?: string; error?: string }> {
  if (!input.password || input.password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const passwordHash = await hashPassword(input.password);
  const created = await createClient({
    slug: input.slug,
    name: input.name,
    formId: input.formId,
    npsScale: input.npsScale,
    passwordHash,
  });

  if (!created.ok || !created.slug) return created;

  const { getClientRecord } = await import('./clients');
  const record = await getClientRecord(created.slug);
  if (!record || record.id === 0) {
    return { ok: false, error: 'Client saved but could not be reloaded from the database.' };
  }

  await replaceStages(record.id, input.stages);
  await upsertQuestionMaps(
    record.id,
    input.questions.map((question, index) => ({
      questionId: question.questionId,
      questionTitle: question.title,
      label: question.label || QUESTIONS.find((item) => item.key === question.questionId)?.label || question.questionId,
      stageKey: question.stageKey,
      isScore: question.isScore && !question.isNps,
      position: index,
    })),
  );

  return { ok: true, slug: created.slug };
}
