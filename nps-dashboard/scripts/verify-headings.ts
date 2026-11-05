import { getClient } from '../src/lib/config.ts';
import { buildStages, normalizeSubmissions } from '../src/lib/normalize.ts';
import { fetchFormBlueprint, fetchTallySubmissions } from '../src/lib/tally.ts';
import { readFileSync } from 'node:fs';

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

const blueprint = await fetchFormBlueprint(env.TALLY_API_KEY, 'yPW566');
const withIds = blueprint.filter((block) => block.questionId);
console.log('blok dengan questionId:', withIds.length, 'dari', blueprint.length);
withIds.slice(0, 5).forEach((block) => console.log('  ', block.questionId, '|', block.title.replace(/^\d+\.\s*/, '').slice(0, 55)));

const { records } = await fetchTallySubmissions(env.TALLY_API_KEY, 'yPW566');
const sample = records[0].fields.filter((field) => field.questionId).slice(0, 3);
console.log('\ncontoh field submission dengan ID:');
sample.forEach((field) => console.log('  ', field.questionId, '|', field.title.slice(0, 50)));

const { responses, scoreKeys } = normalizeSubmissions(records, client);
const stages = buildStages(blueprint, scoreKeys);
console.log('\ntahap:', stages.map((stage) => `${stage.key}(${stage.questions.length})`).join(', '));
console.log('responses:', responses.length);
