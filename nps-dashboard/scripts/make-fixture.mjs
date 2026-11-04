/**
 * Ubah CSV export Tally menjadi fixture JSON untuk mode demo.
 *
 * Hanya kolom skor, NPS, dan metadata non-pribadi yang diambil.
 * Komentar bebas dan nama petugas sengaja dibuang.
 *
 * Usage:
 *   node scripts/make-fixture.mjs <file.csv> <slug>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { csvToSubmissions } from '../src/lib/csv.ts';

const SAFE_COLUMNS = [
  /^submission id$/i,
  /^submitted at$/i,
  /^siapakah anda/i,
  /jenis pelayanan/i,
  /^seberapa puas/i,
  /^seberapa besar kemungkinan/i,
];

const isSafe = (title) => SAFE_COLUMNS.some((pattern) => pattern.test(title.trim()));

const [, , csvPath, slugArg] = process.argv;
if (!csvPath) throw new Error('Usage: node scripts/make-fixture.mjs <file.csv> <slug>');
const slug = (slugArg || 'rsananda').toLowerCase();

const text = await fs.readFile(csvPath, 'utf8');
const records = csvToSubmissions(text);

const sanitized = records
  .map((record) => ({
    id: record.id,
    submittedAt: record.submittedAt,
    fields: record.fields.filter((field) => isSafe(field.title)).map((field) => ({
      title: field.title,
      value: typeof field.value === 'string' ? field.value.trim() : field.value,
    })),
  }))
  .filter((record) => record.fields.some((field) => /^seberapa puas/i.test(field.title)));

const outDir = path.join(process.cwd(), 'src', 'fixtures');
await fs.mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `${slug}.json`);
await fs.writeFile(outFile, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');

console.log(`Wrote ${sanitized.length} records to ${path.relative(process.cwd(), outFile)}`);
