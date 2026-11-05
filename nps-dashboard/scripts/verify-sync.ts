import { readFileSync } from 'node:fs';
import { syncFormStructure } from '../src/lib/sync';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const apiKey = env.TALLY_API_KEY;
if (!apiKey) throw new Error('TALLY_API_KEY tidak ada di .env lokal');

const structure = await syncFormStructure(apiKey, process.argv[2] || 'yPW566');
console.log('stages:', structure.stages.map((stage) => `${stage.key}="${stage.label}"`).join(', '));
console.log('scored questions:', structure.questions.filter((q) => q.isScore).length);
for (const question of structure.questions.filter((q) => q.isScore)) {
  console.log(`  ${question.stageKey ?? '-'} | ${question.label}`);
}
