import type { DashboardData } from './stats';
import { STAGES } from './config';
import { categoryLabel } from './format';

/** CSV memakai BOM agar Excel membaca UTF-8 dengan benar. */
export function dashboardToCsv(data: DashboardData): string {
  const rows: (string | number | null | undefined)[][] = [];
  const push = (...cells: (string | number | null | undefined)[]) => rows.push(cells);

  push('Laporan NPS', data.meta.name);
  push('Periode data', data.filters.from || 'awal data', 'sampai', data.filters.to || 'data terbaru');
  push('Filter layanan', data.filters.service || 'Semua layanan');
  push('Dibuat', new Date(data.meta.generatedAt).toLocaleString('id-ID'));
  push('');
  push('RINGKASAN');
  push('Total responden', data.nps?.total ?? 0);
  push('Skor NPS', data.nps?.score ?? 0);
  push('Promoter (%)', data.nps?.promoterPct ?? 0);
  push('Passive (%)', data.nps?.passivePct ?? 0);
  push('Detractor (%)', data.nps?.detractorPct ?? 0);
  push('Rata-rata kepuasan', data.overallMean ?? '');
  push('');
  push('SKOR PER TAHAP LAYANAN');
  push('Tahap', 'Skor rata-rata', 'Jumlah responden', 'Korelasi (r)', 'Kekuatan', 'Rekomendasi');
  for (const correlation of data.correlations) {
    const stage = data.stages.find((item) => item.key === correlation.key);
    push(
      correlation.label,
      correlation.score ?? '',
      stage?.responses ?? '',
      correlation.r ?? '',
      correlation.strength,
      correlation.recommendation,
    );
  }
  push('');
  push('DISTRIBUSI JAWABAN');
  push('Kategori', 'Jumlah', 'Persentase');
  push('Promoter', data.nps?.promoters ?? 0, data.nps?.promoterPct ?? 0);
  push('Passive', data.nps?.passives ?? 0, data.nps?.passivePct ?? 0);
  push('Detractor', data.nps?.detractors ?? 0, data.nps?.detractorPct ?? 0);
  push('');
  push('TREN HARIAN');
  push('Tanggal', 'Jumlah respons', 'NPS harian');
  for (const point of data.dailyTrend) push(point.date, point.count, point.nps ?? '');
  push('');
  push('BREAKDOWN LAYANAN');
  push('Jenis layanan', 'Jumlah respons', 'NPS segmen', 'Rata-rata skor', 'Promoter', 'Passive', 'Detractor');
  for (const item of data.serviceBreakdown) {
    push(item.label, item.count, item.nps ?? '', item.meanScore ?? '', item.promoters, item.passives, item.detractors);
  }
  push('');
  push('KOMENTAR');
  push('Tanggal', 'Tahap', 'Jenis responden', 'Layanan', 'Komentar');
  for (const comment of data.comments) {
    push(comment.submittedAt.slice(0, 10), comment.stageLabel, comment.respondentType, comment.serviceType, comment.text);
  }

  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`;
}

function escapeCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function csvFileName(data: DashboardData): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const service = data.filters.service ? `-${slugify(data.filters.service)}` : '';
  return `nps-${data.meta.slug}${service}-${stamp}.csv`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function csvCategoryLabel(value: string): string {
  return categoryLabel(value);
}

export { STAGES };
