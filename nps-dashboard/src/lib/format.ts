export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatScore(value: number | null | undefined): string {
  return formatNumber(value, 2);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return `${formatNumber(value, digits)}%`;
}

export function formatSigned(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 0)}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '–';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateShort(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date);
}

export function categoryLabel(value: string): string {
  if (value === 'promoter') return 'Promoter';
  if (value === 'passive') return 'Passive';
  if (value === 'detractor') return 'Detractor';
  return value;
}

export function npsBand(score: number | null | undefined): { label: string; tone: 'great' | 'good' | 'warn' | 'bad' } {
  if (score === null || score === undefined) return { label: 'Belum ada data', tone: 'bad' };
  if (score >= 50) return { label: 'Sangat baik', tone: 'great' };
  if (score >= 0) return { label: 'Baik', tone: 'good' };
  if (score >= -50) return { label: 'Perlu perhatian', tone: 'warn' };
  return { label: 'Kritis', tone: 'bad' };
}

export function strengthTone(strength: string): 'great' | 'good' | 'warn' | 'muted' {
  if (strength === 'Sangat Kuat') return 'great';
  if (strength === 'Kuat') return 'good';
  if (strength === 'Sedang') return 'warn';
  return 'muted';
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
