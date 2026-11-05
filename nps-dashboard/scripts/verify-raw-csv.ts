import { rawSubmissionsToCsv } from '../src/lib/csv-raw';

// Fixture meniru respons Tally: pertanyaan berurutan + submission.
const questions = [
  { id: 'OBpd97', title: 'Nama Petugas CX', type: 'DROPDOWN' },
  { id: '5q68b6', title: 'Siapakah Anda?', type: 'MULTIPLE_CHOICE' },
  { id: 'd2LKNq', title: 'Jenis pelayanan yang sedang / baru diterima', type: 'MULTIPLE_CHOICE' },
  { id: 'vqDVx8', title: '1. Seberapa puas Bapak/Ibu dengan tempat parkir kami?', type: 'LINEAR_SCALE' },
  { id: 'K8xABK', title: 'Apa keluhan atau masukan anda terhadap fasilitas dan layanan parkir ?', type: 'TEXTAREA' },
  { id: 'x1XXYWJ', title: 'Seberapa besar kemungkinan Bapak/Ibu merekomendasikan RS Ananda?', type: 'LINEAR_SCALE' },
];

const submissions = [
  {
    submissionId: 'rDMLNEo',
    respondentId: 'xX5Kp7k',
    submittedAt: '2026-11-04T09:20:45.000Z',
    isCompleted: true,
    answers: {
      OBpd97: ['Wahyu'],
      '5q68b6': ['Pendamping pasien'],
      d2LKNq: ['Layanan lainnya'],
      vqDVx8: 5,
      K8xABK: 'Lahan parkir luas, tapi agak gelap malam hari',
      x1XXYWJ: 5,
    },
  },
  {
    submissionId: 'Nq1Yrb0',
    respondentId: 'ODMvpkp',
    submittedAt: '2026-11-04T06:35:48.000Z',
    isCompleted: true,
    answers: {
      OBpd97: ['Fitra'],
      '5q68b6': ['Pendamping pasien'],
      d2LKNq: ['Poliklinik/Rawat Jalan'],
      vqDVx8: 5,
      x1XXYWJ: 4,
    },
  },
];

const csv = rawSubmissionsToCsv({ questions, submissions, onlyAnswered: true });
const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
console.log('Header kolom:', lines[0].split(',').length);
console.log('Baris data:', lines.length - 1);
console.log('\nHeader:\n' + lines[0]);
console.log('\nBaris 1:\n' + lines[1]);
console.log('\nBaris 2:\n' + lines[2]);

// Cek bentuk: kolom kosong untuk jawaban yang tidak ada, koma di dalam teks ter-escape.
console.log('\nKoma dalam komentar ter-escape:', lines[1].includes('"Lahan parkir luas, tapi agak gelap malam hari"'));
console.log('Kolom kosong di baris 2 (komentar parkir):', lines[2].split('","').length >= 5);
