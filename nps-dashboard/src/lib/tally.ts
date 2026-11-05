import { normalizeDate } from './csv';
import { toText, type FormBlock, type SubmissionRecord } from './normalize';

const TALLY_API = 'https://api.tally.so';
const PAGE_LIMIT = 500;
const MAX_PAGES = 20;

interface TallyQuestion {
  id: string;
  title?: string;
}

interface TallyResponse {
  questionId?: string;
  answer?: unknown;
  formattedAnswer?: string;
}

interface TallySubmission {
  id: string;
  submittedAt?: string;
  isCompleted?: boolean;
  responses?: TallyResponse[];
}

interface TallySubmissionPage {
  page?: number;
  hasMore?: boolean;
  totalNumberOfSubmissionsPerFilter?: { all?: number; completed?: number; partial?: number };
  questions?: TallyQuestion[];
  submissions?: TallySubmission[];
}

export class TallyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TallyError';
    this.status = status;
  }
}

export interface FetchResult {
  records: SubmissionRecord[];
  truncated: boolean;
  completedTotal: number | null;
  /** Urutan blok form (heading + pertanyaan) untuk membaca tahap layanan. */
  blueprint: FormBlock[];
}

/** Ambil semua submission selesai untuk satu form Tally. */
export async function fetchTallySubmissions(apiKey: string, formId: string): Promise<FetchResult> {
  if (!apiKey) throw new TallyError('TALLY_API_KEY belum diatur', 500);
  if (!formId) throw new TallyError('Form ID Tally belum diatur', 500);

  const blueprint = await fetchFormBlueprint(apiKey, formId);
  const records: SubmissionRecord[] = [];
  let page = 1;
  let completedTotal: number | null = null;

  for (let i = 0; i < MAX_PAGES; i++) {
    const url = new URL(`${TALLY_API}/forms/${encodeURIComponent(formId)}/submissions`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(PAGE_LIMIT));
    url.searchParams.set('filter', 'completed');

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new TallyError(
        `Tally API ${response.status}: ${body.slice(0, 200) || response.statusText}`,
        response.status,
      );
    }

    const payload = (await response.json()) as TallySubmissionPage;
    completedTotal ??= payload.totalNumberOfSubmissionsPerFilter?.completed ?? null;
    const titles = new Map((payload.questions ?? []).map((question) => [question.id, question.title ?? '']));

    for (const submission of payload.submissions ?? []) {
      records.push(apiToRecord(submission, titles));
    }

    if (!payload.hasMore) return { records, truncated: false, completedTotal, blueprint };
    page = (payload.page ?? page) + 1;
  }

  return { records, truncated: true, completedTotal, blueprint };
}

interface TallyBlockPayload {
  title?: string;
  text?: string;
  safeHTMLSchema?: unknown;
}

interface TallyBlock {
  type?: string;
  payload?: TallyBlockPayload;
}

/** Ambil struktur form (urutan heading dan pertanyaan) dari Tally. */
export async function fetchFormBlueprint(apiKey: string, formId: string): Promise<FormBlock[]> {
  const response = await fetch(`${TALLY_API}/forms/${encodeURIComponent(formId)}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new TallyError(`Tally API ${response.status}: ${body.slice(0, 200) || response.statusText}`, response.status);
  }

  const payload = (await response.json()) as { blocks?: TallyBlock[] };
  return (payload.blocks ?? []).map((block) => ({
    type: block.type ?? '',
    title: blockTitle(block.payload),
  }));
}

function blockTitle(payload: TallyBlockPayload | undefined): string {
  if (!payload) return '';
  if (payload.title) return payload.title;
  if (Array.isArray(payload.safeHTMLSchema)) {
    return payload.safeHTMLSchema
      .map((part) => (Array.isArray(part) ? String(part[0] ?? '') : String(part ?? '')))
      .join('')
      .trim();
  }
  return payload.text ?? '';
}

function apiToRecord(submission: TallySubmission, titles: Map<string, string>): SubmissionRecord {
  return {
    id: submission.id,
    submittedAt: normalizeDate(submission.submittedAt),
    fields: (submission.responses ?? []).map((response) => {
      const title = response.questionId ? titles.get(response.questionId) ?? '' : '';
      const value = response.answer ?? response.formattedAnswer ?? '';
      return { title, value: Array.isArray(value) ? value.map(toText).join(', ') : value };
    }),
  };
}
