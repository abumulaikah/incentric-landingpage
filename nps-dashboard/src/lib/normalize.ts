import type { ClientConfig, QuestionKey } from './config';
import { CLIENT_META, QUESTIONS, STAGES } from './config';
import type { CommentRecord, SurveyResponse } from './types';

export interface FieldRecord {
  title: string;
  value: unknown;
}

export interface SubmissionRecord {
  id: string;
  submittedAt: string;
  fields: FieldRecord[];
}

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const isCommentTitle = (title: string) =>
  /^(apa keluhan|keluhan|masukan|saran|kritik)/i.test(title.trim()) ||
  /keluhan atau masukan/i.test(title);

const isScoreTitle = (title: string) => /^seberapa\s+(puas|besar)/i.test(title.trim());

const containsKeyword = (haystack: string, keyword: string) => haystack.includes(normalize(keyword));

const STAGE_OF_QUESTION: Record<QuestionKey, string> = {
  parkir: 'kedatangan',
  satpam: 'kedatangan',
  pendaftaran: 'pendaftaran',
  tungguDokter: 'pemeriksaan',
  pemeriksaanDokter: 'pemeriksaan',
  kasir: 'kasirFarmasi',
  obat: 'kasirFarmasi',
  farmasi: 'kasirFarmasi',
  kamar: 'kamarInap',
  fasilitasUmum: 'fasilitasUmum',
};

export function parseScaleValue(value: unknown, client: ClientConfig): number | null {
  if (typeof value === 'number') return validateScale(value, client);
  if (typeof value === 'string') {
    const cleaned = value.replace(',', '.').trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return validateScale(parsed, client);
  }
  return null;
}

function validateScale(value: number, client: ClientConfig): number | null {
  const max = client.npsScale === '1-5' ? 5 : 10;
  const min = client.npsScale === '1-5' ? 1 : 0;
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

/** Cari pertanyaan skor yang paling spesifik untuk sebuah judul. */
export function matchQuestionKey(title: string): QuestionKey | null {
  if (!title || isCommentTitle(title) || !isScoreTitle(title)) return null;
  const haystack = normalize(title);

  let best: { key: QuestionKey; weight: number } | null = null;
  for (const question of QUESTIONS) {
    for (const keyword of question.titleKeywords) {
      if (containsKeyword(haystack, keyword)) {
        const weight = normalize(keyword).length;
        if (!best || weight > best.weight) best = { key: question.key, weight };
      }
    }
  }
  return best?.key ?? null;
}

export function matchNps(title: string): boolean {
  const haystack = normalize(title);
  return CLIENT_META.npsKeywords.some((keyword) => containsKeyword(haystack, keyword));
}

export function matchField(title: string, keywords: string[]): boolean {
  const haystack = normalize(title);
  return keywords.some((keyword) => containsKeyword(haystack, keyword));
}

export function stageForQuestion(key: QuestionKey): string | null {
  return STAGE_OF_QUESTION[key] ?? null;
}

export function stageLabel(stageKey: string | null): string {
  if (!stageKey) return 'Umum';
  return STAGES.find((stage) => stage.key === stageKey)?.label ?? 'Umum';
}

/**
 * Ubah submission mentah menjadi model survey.
 *
 * Mendukung CSV export Tally maupun response Tally API karena keduanya
 * direduksi menjadi pasangan (judul pertanyaan, jawaban).
 */
export function normalizeSubmissions(
  records: SubmissionRecord[],
  client: ClientConfig,
): { responses: SurveyResponse[]; unmappedTitles: string[] } {
  const unmapped = new Set<string>();
  const responses: SurveyResponse[] = [];

  for (const record of records) {
    const scores: Partial<Record<QuestionKey, number>> = {};
    const comments: CommentRecord[] = [];
    let nps: number | null = null;
    let respondentType = '';
    let serviceType = '';
    let staff = '';
    let doctor = '';
    let lastScoreKey: QuestionKey | null = null;

    for (const field of record.fields) {
      const title = field.title?.trim() ?? '';
      if (!title) continue;

      if (matchNps(title)) {
        const value = parseScaleValue(field.value, client);
        if (value !== null) nps = value;
        lastScoreKey = null;
        continue;
      }

      if (isCommentTitle(title)) {
        const text = toText(field.value);
        if (text) {
          comments.push({
            label: title,
            stageKey: lastScoreKey ? stageForQuestion(lastScoreKey) : null,
            text,
          });
        }
        continue;
      }

      const key = matchQuestionKey(title);
      if (key) {
        const value = parseScaleValue(field.value, client);
        if (value !== null) scores[key] = value;
        lastScoreKey = key;
        continue;
      }

      if (isScoreTitle(title)) unmapped.add(title);

      if (!respondentType && matchField(title, CLIENT_META.respondentTypeTitleKeywords)) {
        respondentType = toText(field.value);
      } else if (!serviceType && matchField(title, CLIENT_META.serviceTitleKeywords)) {
        serviceType = toText(field.value);
      } else if (!staff && matchField(title, CLIENT_META.staffTitleKeywords)) {
        staff = toText(field.value);
      } else if (!doctor && matchField(title, CLIENT_META.doctorTitleKeywords)) {
        doctor = toText(field.value);
      } else {
        const extraText = toText(field.value);
        if (extraText && matchField(title, CLIENT_META.extraCommentKeywords)) {
          comments.push({ label: title, stageKey: null, text: extraText });
        }
      }
    }

    if (Object.keys(scores).length === 0 && nps === null) continue;

    responses.push({
      id: record.id,
      submittedAt: record.submittedAt,
      scores,
      nps,
      respondentType,
      serviceType,
      staff,
      doctor,
      comments,
    });
  }

  return { responses, unmappedTitles: [...unmapped] };
}

export function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ');
  return '';
}
