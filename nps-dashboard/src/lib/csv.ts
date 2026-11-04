import type { SubmissionRecord } from './normalize';

/**
 * Parser CSV minimal tanpa dependency.
 * Mendukung kutip ganda, kutip escape (""), dan newline di dalam sel.
 */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char === '\r') {
      // Lewati CR pada CRLF.
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim() !== ''));
}

/** Ubah CSV export Tally menjadi submission netral. */
export function csvToSubmissions(text: string): SubmissionRecord[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((cell) => cell.trim());
  const idIndex = header.findIndex((cell) => /^submission id$/i.test(cell));
  const dateIndex = header.findIndex((cell) => /submitted at|submitted_at|timestamp/i.test(cell));

  return rows.slice(1).map((row, index) => ({
    id: idIndex >= 0 ? row[idIndex] || `row-${index + 1}` : `row-${index + 1}`,
    submittedAt: dateIndex >= 0 ? normalizeDate(row[dateIndex]) : '',
    fields: header.map((title, column) => ({
      title,
      value: row[column] ?? '',
    })),
  }));
}

/** Tally mengirim "2026-11-04 06:35:48" (waktu lokal) atau ISO penuh. */
export function normalizeDate(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  const localMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
  if (localMatch) return `${localMatch[1]}T${localMatch[2].padEnd(8, ':00')}`;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString();
}
