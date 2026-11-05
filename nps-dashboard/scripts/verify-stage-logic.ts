import { buildStages, normalizeSubmissions } from '../src/lib/normalize.ts';
import { getClient } from '../src/lib/config.ts';

// Blueprint tiruan mengikuti struktur form RS Ananda.
const blueprint = [
  { type: 'HEADING_2', title: 'Perkenalan' },
  { type: 'TITLE', title: 'Siapakah Anda?', questionId: 'q1' },
  { type: 'HEADING_2', title: 'Kedatangan' },
  { type: 'TITLE', title: '1. Seberapa puas Bapak/Ibu dengan tempat parkir kami?', questionId: 'q2' },
  { type: 'HEADING_2', title: 'Pendaftaran' },
  { type: 'TITLE', title: '3. Seberapa puas Bapak/Ibu dengan proses pendaftaran?', questionId: 'q3' },
  { type: 'HEADING_2', title: 'Pemeriksaan' },
  { type: 'TITLE', title: '5. Seberapa puas Bapak/Ibu dengan ketelitian pemeriksaan dokter?', questionId: 'q4' },
  { type: 'TITLE', title: '6. Seberapa puas Bapak/Ibu dengan kebersihan kamar tempat Bapak/Ibu dirawat?', questionId: 'q5' },
  { type: 'HEADING_2', title: 'Kasir & Farmasi' },
  { type: 'TITLE', title: '7. Seberapa puas Bapak/Ibu dengan pelayanan di Kasir?', questionId: 'q6' },
];

const scores = new Set(['parkir', 'pendaftaran', 'pemeriksaanDokter', 'kamar', 'kasir']);
const stages = buildStages(blueprint, scores);

console.log('Tahap hasil form:');
for (const stage of stages) {
  console.log(`  ${stage.key} "${stage.label}" -> ${stage.questions.join(', ')}`);
}

const hasInpatientStage = stages.some((stage) => stage.key === 'kamarInap' || /kamar/i.test(stage.label));
console.log('\nAda tahap Kamar Inap?', hasInpatientStage ? 'YA (salah)' : 'TIDAK (benar)');

const exam = stages.find((stage) => /pemeriksaan/i.test(stage.label));
console.log('Kamar ada di Pemeriksaan?', exam?.questions.includes('kamar') ? 'YA (benar)' : 'TIDAK (salah)');

// Pastikan data lama dengan skor kamar tetap terbaca dan masuk ke Pemeriksaan.
const client = getClient('rsananda');
if (!client) throw new Error('client rsananda tidak ditemukan');

const responses = [
  {
    id: 'a',
    submittedAt: '2026-11-04T06:00:00',
    fields: [
      { title: '6. Seberapa puas Bapak/Ibu dengan kebersihan kamar tempat Bapak/Ibu dirawat?', value: '4' },
      { title: '5. Seberapa puas Bapak/Ibu dengan ketelitian pemeriksaan dokter?', value: '5' },
    ],
  },
];
const { scoreKeys } = normalizeSubmissions(responses, client);
const stages2 = buildStages(blueprint, scoreKeys);
console.log('\nTanpa heading kamar, skor kamar tetap masuk:', stages2.find((s) => /pemeriksaan/i.test(s.label))?.questions.join(', '));
