import { readFileSync } from 'node:fs';
import { getClient } from '../src/lib/config.ts';
import { normalizeSubmissions } from '../src/lib/normalize.ts';
import { buildDashboard } from '../src/lib/stats.ts';
import { fetchTallySubmissions } from '../src/lib/tally.ts';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const client = getClient('rsananda');
if (!client) throw new Error('client rsananda tidak ditemukan');

const { records, truncated, completedTotal } = await fetchTallySubmissions(env.TALLY_API_KEY, 'yPW566');
const { responses, unmappedTitles } = normalizeSubmissions(records, client);
const data = buildDashboard({
  client,
  responses,
  source: 'tally',
  totalSubmissions: completedTotal ?? records.length,
  filters: { from: null, to: null, service: null },
  availableServices: [...new Set(responses.map((r) => r.serviceType).filter(Boolean))].sort(),
});

console.log('records:', records.length, 'completedTotal:', completedTotal, 'truncated:', truncated);
console.log('responses:', responses.length, 'tanpa NPS:', responses.filter((r) => r.nps === null).length);
console.log('unmapped:', unmappedTitles);
console.log('NPS:', JSON.stringify(data.nps));
console.log('rata-rata:', data.overallMean, 'butir:', data.overallMeanCount);
console.log('tahap:', data.stages.map((s) => `${s.shortLabel} ${s.score} (n=${s.responses})`).join(' | '));
console.log('korelasi:', data.correlations.map((c) => `${c.shortLabel} r=${c.r}`).join(' | '));
console.log('layanan:', data.serviceBreakdown.map((s) => `${s.label}: ${s.count} (NPS ${s.nps})`).join(' | '));
console.log('komentar:', data.comments.length);
