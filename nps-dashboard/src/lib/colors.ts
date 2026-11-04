/** Warna kategori NPS, dipakai konsisten di seluruh UI dan ekspor. */
export const COLORS = {
  promoter: '#014fcf',
  passive: '#ffbc00',
  detractor: '#e11d48',
  primary: '#014fcf',
  accent: '#0d9488',
  ink: '#0f172a',
  muted: '#64748b',
  grid: '#e2e8f0',
} as const;

export const CATEGORY_LABEL: Record<string, string> = {
  promoter: 'Promoter',
  passive: 'Passive',
  detractor: 'Detractor',
};

export const CATEGORY_HINT: Record<string, string> = {
  promoter: 'Skor tertinggi — loyal dan bersedia merekomendasikan',
  passive: 'Cukup puas, belum loyal',
  detractor: 'Berpotensi menyebarkan pengalaman negatif',
};
