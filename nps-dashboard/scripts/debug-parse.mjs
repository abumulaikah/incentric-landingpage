import { csvToSubmissions } from './csv';
import { getClient } from './config';
import { normalizeSubmissions } from './normalize';

async function main() {
  const client = getClient('rsananda');
  if (!client) throw new Error('Client rsananda tidak ditemukan');

  const csvPath = process.argv[2];
  if (!csvPath) throw new Error('Usage: node scripts/debug-parse.mjs <file.csv>');

  const fs = await import('node:fs/promises');
  const text = await fs.readFile(csvPath, 'utf8');
  const records = csvToSubmissions(text);
  const { responses, unmappedTitles } = normalizeSubmissions(records, client);

  console.log('records:', records.length, 'responses:', responses.length);
  console.log('unmapped:', unmappedTitles);
  console.log('first:', responses[0]);
}

main();
