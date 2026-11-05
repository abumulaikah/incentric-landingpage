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

/** Password ramah dibaca: tanpa karakter ambigu (0/O, 1/l/I). */
export function generatePassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export interface QuestionDraft {
  questionId: string;
  label: string;
  stageKey: string | null;
  isScore: boolean;
  isNps: boolean;
  title: string;
}

export interface ConnectedClient {
  ok: boolean;
  slug?: string;
  password?: string;
  name?: string;
  formId?: string;
  stages?: number;
  questions?: number;
  error?: string;
}

/**
 * Alur utama admin: nama + Form ID → baca Tally → simpan → dashboard siap.
 * Tahap dan label pertanyaan diturunkan otomatis; tidak ada langkah manual.
 */
export async function connectClient(input: {
  name: string;
  formId: string;
  apiKey: string;
  npsScale?: '1-5' | '0-10';
}): Promise<ConnectedClient> {
  const name = input.name.trim();
  const formId = input.formId.trim();

  if (!name) return { ok: false, error: 'Client name is required.' };
  if (!/^[A-Za-z0-9]{4,}$/.test(formId)) {
    return { ok: false, error: 'Tally form ID looks invalid. Use the short ID from the form URL.' };
  }

  let structure: Awaited<ReturnType<typeof syncFormStructure>>;
  try {
    structure = await syncFormStructure(input.apiKey, formId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read the Tally form.';
    return { ok: false, error: `Tally: ${message}` };
  }

  if (structure.stages.length === 0) {
    return {
      ok: false,
      error: 'No headings found in the Tally form. Add Heading blocks so questions can be grouped into service stages.',
    };
  }

  const scored = structure.questions.filter((question) => question.isScore);
  if (scored.length === 0) {
    return { ok: false, error: 'No scored questions found. Add your scale questions in Tally first.' };
  }

  const password = generatePassword(12);
  const passwordHash = await hashPassword(password);

  const created = await createClient({
    slug: slugify(name),
    name,
    formId,
    npsScale: input.npsScale ?? '1-5',
    passwordHash,
  });

  if (!created.ok || !created.slug) return { ok: false, error: created.error };

  const { getClientRecord } = await import('./clients');
  const record = await getClientRecord(created.slug);
  if (!record || record.id === 0) {
    return { ok: false, error: 'Client saved but could not be reloaded from the database.' };
  }

  await replaceStages(record.id, structure.stages);
  await upsertQuestionMaps(
    record.id,
    structure.questions.map((question, index) => ({
      questionId: question.questionId,
      questionTitle: question.title,
      label:
        question.label ||
        QUESTIONS.find((item) => item.key === question.questionId)?.label ||
        question.questionId,
      stageKey: question.isScore && !question.isNps ? question.stageKey : null,
      isScore: question.isScore && !question.isNps,
      position: index,
    })),
  );

  return {
    ok: true,
    slug: created.slug,
    password,
    name,
    formId,
    stages: structure.stages.length,
    questions: scored.length,
  };
}
