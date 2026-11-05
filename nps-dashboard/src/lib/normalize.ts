import type { ClientConfig, QuestionKey, StageDef } from './config';
import { CLIENT_META, QUESTIONS, STAGES, STAGE_TAG_PATTERN } from './config';
import type { CommentRecord, SurveyResponse } from './types';

export interface FieldRecord {
  title: string;
  value: unknown;
}

/** Potongan form Tally berurutan, termasuk heading sebagai penanda tahap. */
export interface FormBlock {
  type: string;
  title: string;
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

const isScoreTitle = (title: string) => /^(\d+[.)]\s*)?seberapa\s+(puas|besar)/i.test(title.trim());

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

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

/** Buang prefix nomor ("1. ", "3) ") dari judul pertanyaan. */
const stripNumbering = (title: string) => title.replace(/^\s*\d+\s*[.)]\s*/, '').trim();

export function parseStageTag(title: string): string | null {
  const match = title.match(STAGE_TAG_PATTERN);
  return match ? match[1].toLowerCase() : null;
}

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

/** Cari definisi pertanyaan skor yang paling spesifik untuk sebuah judul. */
export function matchQuestionKey(title: string): QuestionKey | null {
  const trimmed = stripNumbering(title);
  if (!trimmed || isCommentTitle(trimmed) || !isScoreTitle(trimmed)) return null;
  const haystack = normalize(trimmed);

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
  const haystack = normalize(stripNumbering(title));
  return CLIENT_META.npsKeywords.some((keyword) => containsKeyword(haystack, keyword));
}

export function matchField(title: string, keywords: string[]): boolean {
  const haystack = normalize(title);
  return keywords.some((keyword) => containsKeyword(haystack, keyword));
}

export function stageForQuestion(key: QuestionKey): string | null {
  return STAGE_OF_QUESTION[key] ?? null;
}

/** Key tahap untuk judul heading Tally. Kalau tanpa tag, diturunkan dari nama. */
function stageKeyFromHeadingRaw(title: string): string {
  const tagged = parseStageTag(title);
  if (tagged) return tagged;

  const known = STAGES.find((stage) => normalize(stage.label) === normalize(title) || normalize(stage.shortLabel) === normalize(title));
  if (known) return known.key;

  return `custom-${normalize(stripHtml(title)).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
}

export function stageKeyFromHeading(title: string): string {
  return stageKeyFromHeadingRaw(title);
}

export interface StagePlan {
  /** Urutan tahap sesuai form Tally. */
  stages: StageDef[];
  /** Tahap yang dibaca dari Heading, bukan dari daftar bawaan. */
  fromForm: boolean;
}

/**
 * Bangun daftar tahap dari struktur form Tally bila ada Heading.
 * Fallback ke STAGES bawaan bila form tidak punya Heading.
 */
export function resolveStages(blueprint: FormBlock[] | undefined): StagePlan {
  const headings = (blueprint ?? []).filter((block) => /^HEADING/i.test(block.type));

  if (headings.length === 0) return { stages: STAGES, fromForm: false };

  const stages: StageDef[] = [];
  const seen = new Set<string>();

  for (const heading of headings) {
    const title = stripHtml(heading.title);
    if (!title) continue;

    const key = stageKeyFromHeading(title);
    // Heading seperti "Perkenalan" atau "NPS" hanya penanda, bukan tahap skor.
    if (key === 'perkenalan' || key === 'nps' || key === 'introduction') continue;
    if (seen.has(key)) continue;
    seen.add(key);

    stages.push({
      key,
      label: title,
      shortLabel: title,
      questions: [],
    });
  }

  return { stages: stages.length > 0 ? stages : STAGES, fromForm: stages.length > 0 };
}

/** Petakan tiap pertanyaan skor ke tahap sesuai posisinya di form. */
function questionsByHeading(blueprint: FormBlock[] | undefined, plan: StagePlan): Map<string, QuestionKey[]> {
  const mapping = new Map<string, QuestionKey[]>();
  if (!plan.fromForm || !blueprint) return mapping;

  let currentStage: string | null = null;
  for (const block of blueprint) {
    const title = stripHtml(block.title);

    if (/^HEADING/i.test(block.type)) {
      const key = stageKeyFromHeading(title);
      currentStage = plan.stages.some((stage) => stage.key === key) ? key : null;
      continue;
    }

    if (block.type !== 'TITLE' || !currentStage) continue;
    if (matchNps(title)) continue;
    const questionKey = matchQuestionKey(title);
    if (!questionKey) continue;

    const list = mapping.get(currentStage) ?? [];
    if (!list.includes(questionKey)) list.push(questionKey);
    mapping.set(currentStage, list);
  }

  // Kamar rawat inap boleh berada di bawah tahap pemeriksaan, tetapi tetap
  // dikeluarkan dari tahap itu agar tampil sebagai tahap tersendiri.
  for (const stage of plan.stages) {
    const list = mapping.get(stage.key);
    if (!list?.includes('kamar')) continue;
    const withoutKamar = list.filter((question) => question !== 'kamar');
    if (withoutKamar.length > 0) mapping.set(stage.key, withoutKamar);
    else mapping.delete(stage.key);
  }

  return mapping;
}

/**
 * Gabungkan tahap dari form dengan pertanyaan skor.
 * Tahap yang tidak punya pertanyaan tidak ditampilkan.
 */
export function buildStages(blueprint: FormBlock[] | undefined, scores: Set<QuestionKey>): StageDef[] {
  const plan = resolveStages(blueprint);

  if (!plan.fromForm) {
    return plan.stages.map((stage) => ({
      ...stage,
      questions: stage.questions.filter((question) => scores.has(question)),
    }));
  }

  const mapping = questionsByHeading(blueprint, plan);

  const stages: StageDef[] = plan.stages
    .map((stage) => ({
      ...stage,
      questions: (mapping.get(stage.key) ?? []).filter((question) => scores.has(question)),
    }))
    .filter((stage) => stage.questions.length > 0);

  // Sisipkan tahap Kamar Rawat Inap tepat setelah tahap yang memuatnya.
  if (scores.has('kamar') && !stages.some((stage) => stage.key === 'kamarInap')) {
    const inpatient: StageDef = {
      key: 'kamarInap',
      label: 'Kamar Rawat Inap',
      shortLabel: 'Kamar Inap',
      questions: ['kamar'],
      optional: true,
    };
    const examIndex = stages.findIndex((stage) => stage.key === 'pemeriksaan');
    if (examIndex >= 0) stages.splice(examIndex + 1, 0, inpatient);
    else stages.push(inpatient);
  }

  // Nama tampilan mengikuti Heading di form, tapi dipendekkan untuk grafik.
  for (const stage of stages) {
    stage.shortLabel = shortLabelFor(stage.label);
  }

  return stages;
}

const SHORT_LABELS: Record<string, string> = {
  Kedatangan: 'Kedatangan',
  Pendaftaran: 'Pendaftaran',
  Pemeriksaan: 'Pemeriksaan',
  'Kasir & Farmasi': 'Kasir & Farmasi',
  Fasilitas: 'Fasilitas',
  'Kamar Rawat Inap': 'Kamar Inap',
};

function shortLabelFor(label: string): string {
  const direct = SHORT_LABELS[label];
  if (direct) return direct;
  const known = STAGES.find((stage) => normalize(stage.label) === normalize(label));
  if (known) return known.shortLabel;
  return label.length > 16 ? `${label.slice(0, 15)}…` : label;
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
): { responses: SurveyResponse[]; unmappedTitles: string[]; scoreKeys: Set<QuestionKey> } {
  const unmapped = new Set<string>();
  const scoreKeys = new Set<QuestionKey>();
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
        if (value !== null) {
          scores[key] = value;
          scoreKeys.add(key);
        }
        lastScoreKey = key;
        continue;
      }

      if (isScoreTitle(title)) unmapped.add(stripNumbering(title));

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

  return { responses, unmappedTitles: [...unmapped], scoreKeys };
}

export function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ');
  return '';
}
