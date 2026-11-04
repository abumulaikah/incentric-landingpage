import { readFileSync } from 'node:fs';
import { getClient } from '../src/lib/config.ts';
import { normalizeSubmissions } from '../src/lib/normalize.ts';
import { buildDashboard } from '../src/lib/stats.ts';

const client = getClient('rsananda');
if (!client) throw new Error('client rsananda tidak ditemukan');

const records = JSON.parse(readFileSync('src/fixtures/rsananda.json', 'utf8'));
const { responses, unmappedTitles } = normalizeSubmissions(records, client);
const data = buildDashboard({
  client,
  responses,
  source: 'fixture',
  totalSubmissions: records.length,
  filters: { from: null, to: null, service: null },
  availableServices: [],
});

console.log('responses', responses.length, 'unmapped', unmappedTitles);
console.log('nps', data.nps);
console.log('overall', data.overallMean, 'items answered', data.overallMeanCount);
console.log('stages', data.stages.map((stage) => `${stage.label}: ${stage.score} (${stage.responses})`).join(' | '));
console.log('correlations', data.correlations.map((c) => `${c.label}: r=${c.r} ${c.strength}`).join('\n  '));
console.log('services', data.serviceBreakdown);
