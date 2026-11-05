import { readFileSync } from 'node:fs';
import { createSyncPreview } from '../src/lib/admin-actions.ts';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);
process.env.TALLY_API_KEY = env.TALLY_API_KEY;

const preview = await createSyncPreview({ name: 'RSU Ananda Srengat', formId: 'yPW566' });
console.log('stages:', preview.stages.map((stage) => `${stage.key}="${stage.label}"`).join(', '));
console.log('questions:', preview.questions.length, '| unknown labels:', preview.unknownCount);
console.log('\npertanyaan skor:');
for (const question of preview.questions.filter((item) => item.isScore)) {
  console.log(`  ${question.stageKey ?? '-'} | ${question.label}`);
}
