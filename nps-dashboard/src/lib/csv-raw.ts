import type { RawFormQuestion, RawSubmission } from './tally';

/**
 * CSV mentah bergaya export Tally: satu baris per submission,
 * satu kolom per pertanyaan, judul kolom memakai judul pertanyaan asli.
 */

const escapeCell = (value: unknown): string => {
  const text = formatValue(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.name === 'string') return record.name;
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Tanggal gaya Tally: 2026-11-04 06:35:48.
 *
 * Tally mengirim waktu lokal (WIB) tetapi menandainya "Z". Karena itu
 * komponen UTC dipakai agar hasilnya sama persis dengan export Tally,
 * tidak bergeser oleh zona waktu server.
 */
function tallyDate(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.replace('T', ' ').replace(/\.\d+Z?$/, '').replace('Z', '');
  const pad = (input: number) => String(input).padStart(2, '0');
  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())} ${pad(parsed.getUTCHours())}:${pad(parsed.getUTCMinutes())}:${pad(parsed.getUTCSeconds())}`;
}

export interface RawCsvOptions {
  questions: RawFormQuestion[];
  submissions: RawSubmission[];
  /** Hanya ambil pertanyaan yang punya jawaban di data. */
  onlyAnswered?: boolean;
}

export function rawSubmissionsToCsv(options: RawCsvOptions): string {
  const { questions, submissions } = options;

  const answeredIds = new Set<string>();
  for (const submission of submissions) {
    for (const [questionId, value] of Object.entries(submission.answers)) {
      if (formatValue(value).trim() !== '') answeredIds.add(questionId);
    }
  }

  const columns = questions.filter((question) => !options.onlyAnswered || answeredIds.has(question.id));

  const header = [
    'Submission ID',
    'Respondent ID',
    'Submitted at',
    ...columns.map((question) => question.title || question.id),
  ];

  const rows: string[][] = [header];

  for (const submission of submissions) {
    rows.push([
      submission.submissionId,
      submission.respondentId,
      tallyDate(submission.submittedAt),
      ...columns.map((question) => formatValue(submission.answers[question.id])),
    ]);
  }

  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
}

export function rawCsvFileName(slug: string, service: string | null): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = service ? `-${service.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  return `tally-${slug}${suffix}-${stamp}.csv`;
}
