/**
 * Konfigurasi dashboard NPS Incentric.
 *
 * Semua yang berubah antar-client ada di sini: form Tally, skala NPS,
 * dan pemetaan pertanyaan ke tahap layanan.
 */

/**
 * Kunci pertanyaan. Bebas (string) supaya client baru bisa menambah
 * pertanyaan sendiri tanpa mengubah kode.
 */
export type QuestionKey = string;

export interface QuestionDef {
  key: QuestionKey;
  /** Label pendek untuk grafik dan tabel. */
  label: string;
  /** Judul pertanyaan di Tally, dipakai untuk mencocokkan jawaban. */
  titleKeywords: string[];
  /** Kata kunci pertanyaan komentar yang mengikuti pertanyaan skor ini. */
  commentKeywords?: string[];
}

export interface StageDef {
  key: string;
  label: string;
  shortLabel: string;
  questions: QuestionKey[];
  /** Tahap opsional: hanya tampil jika ada data. */
  optional?: boolean;
}

/** Penanda tahap yang ditulis tim di judul Heading form Tally. */
export const STAGE_TAG_PATTERN = /\[\[\s*stage\s*:\s*([a-z0-9_-]+)\s*\]\]/i;

export interface ClientConfig {
  slug: string;
  name: string;
  shortName: string;
  formId: string;
  /** Skala pertanyaan rekomendasi. */
  npsScale: '1-5' | '0-10';
  /** Nama pertanyaan rekomendasi (untuk label di UI). */
  npsTitle: string;
  /** Pertanyaan yang dipakai untuk skor rata-rata keseluruhan. */
  stageOrder: string[];
  /** Tampilkan tahap kamar rawat inap bila ada jawaban. */
  showInpatientRoom: boolean;
}

export const QUESTIONS: QuestionDef[] = [
  {
    key: 'parkir',
    label: 'Tempat parkir',
    titleKeywords: ['tempat parkir', 'lahan parkir'],
    commentKeywords: ['parkir'],
  },
  {
    key: 'satpam',
    label: 'Satpam & informasi',
    titleKeywords: ['satpam', 'petugas keamanan'],
    commentKeywords: ['satpam', 'informasi'],
  },
  {
    key: 'pendaftaran',
    label: 'Pendaftaran & administrasi',
    titleKeywords: ['proses pendaftaran', 'mendaftar di loket', 'administrasi'],
    commentKeywords: ['pendaftaran'],
  },
  {
    key: 'tungguDokter',
    label: 'Waktu tunggu dokter',
    titleKeywords: ['lamanya waktu menunggu', 'sebelum dipanggil'],
  },
  {
    key: 'pemeriksaanDokter',
    label: 'Pemeriksaan dokter',
    titleKeywords: ['ketelitian pemeriksaan', 'pemeriksaan dokter', 'penjelasan kesehatan'],
    commentKeywords: ['pelayanan medis'],
  },
  {
    key: 'kasir',
    label: 'Kasir',
    titleKeywords: ['pelayanan di kasir', 'proses pembayaran'],
    commentKeywords: ['kasir', 'pembayaran'],
  },
  {
    key: 'obat',
    label: 'Waktu tunggu obat',
    titleKeywords: ['waktu menunggu obat', 'obat disiapkan'],
  },
  {
    key: 'farmasi',
    label: 'Petugas farmasi',
    titleKeywords: ['petugas farmasi', 'petugas apotek', 'aturan minum obat'],
    commentKeywords: ['farmasi', 'apotek'],
  },
  {
    key: 'kamar',
    label: 'Kamar rawat inap',
    titleKeywords: ['kamar tempat', 'kenyamanan kamar'],
    commentKeywords: ['kenyamanan kamar', 'kamar'],
  },
  {
    key: 'fasilitasUmum',
    label: 'Fasilitas umum',
    titleKeywords: ['fasilitas umum', 'toilet', 'mushola'],
    commentKeywords: ['fasilitas umum'],
  },
];

export const STAGES: StageDef[] = [
  {
    key: 'kedatangan',
    label: 'Kedatangan',
    shortLabel: 'Kedatangan',
    questions: ['parkir', 'satpam'],
  },
  {
    key: 'pendaftaran',
    label: 'Pendaftaran & Administrasi',
    shortLabel: 'Pendaftaran',
    questions: ['pendaftaran'],
  },
  {
    key: 'pemeriksaan',
    label: 'Pemeriksaan Medis',
    shortLabel: 'Pemeriksaan',
    // Kamar rawat inap ikut di sini; di form Tally pertanyaan itu hanya
    // muncul untuk responden rawat inap (conditional logic).
    questions: ['tungguDokter', 'pemeriksaanDokter', 'kamar'],
  },
  {
    key: 'kasirFarmasi',
    label: 'Kasir & Farmasi',
    shortLabel: 'Kasir & Farmasi',
    questions: ['kasir', 'obat', 'farmasi'],
  },
  {
    key: 'fasilitasUmum',
    label: 'Fasilitas Umum',
    shortLabel: 'Fasilitas',
    questions: ['fasilitasUmum'],
  },
];

export const CLIENT_META = {
  respondentTypeTitleKeywords: ['siapakah anda'],
  serviceTitleKeywords: ['jenis pelayanan'],
  staffTitleKeywords: ['nama petugas'],
  doctorTitleKeywords: ['dokter yang merawat', 'dokter yang melayani'],
  extraCommentKeywords: [
    'kurang nyaman',
    'masalah yang dirasakan',
    'kesan dan pengalaman',
    'catatan tambahan',
  ],
  npsKeywords: ['merekomendasikan'],
};

export const CLIENTS: ClientConfig[] = [
  {
    slug: 'rsananda',
    name: 'RSU Ananda Srengat',
    shortName: 'RS Ananda',
    formId: 'yPW566',
    npsScale: '1-5',
    npsTitle: 'Kemungkinan merekomendasikan RS Ananda',
    stageOrder: ['kedatangan', 'pendaftaran', 'pemeriksaan', 'kasirFarmasi', 'fasilitasUmum'],
    showInpatientRoom: true,
  },
];

export function getClient(slug: string): ClientConfig | undefined {
  const normalized = slug.trim().toLowerCase();
  return CLIENTS.find((client) => client.slug === normalized);
}

export function getQuestion(key: QuestionKey): QuestionDef {
  const question = QUESTIONS.find((item) => item.key === key);
  if (!question) throw new Error(`Unknown question: ${key}`);
  return question;
}
