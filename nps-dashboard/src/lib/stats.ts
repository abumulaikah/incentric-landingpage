import type { ClientConfig, QuestionKey, StageDef } from './config';
import { QUESTIONS, STAGES } from './config';
import type { SurveyResponse } from './types';

export type NpsCategory = 'promoter' | 'passive' | 'detractor';

export interface NpsSummary {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPct: number;
  passivePct: number;
  detractorPct: number;
  score: number;
}

export interface StageScore {
  key: string;
  label: string;
  shortLabel: string;
  score: number | null;
  responses: number;
  optional: boolean;
}

export interface CorrelationResult {
  key: string;
  label: string;
  shortLabel: string;
  score: number | null;
  r: number | null;
  n: number;
  strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Weak' | 'None';
  recommendation: string;
  rank: number;
}

export interface CommentView {
  id: string;
  submittedAt: string;
  label: string;
  stageKey: string | null;
  stageLabel: string;
  text: string;
  respondentType: string;
  serviceType: string;
}

export interface ItemScore {
  key: QuestionKey;
  label: string;
  score: number | null;
  responses: number;
  stageKey: string | null;
  stageLabel?: string;
}

export interface DistributionPoint {
  value: number;
  count: number;
  category: NpsCategory | null;
}

export interface ServiceBreakdown {
  label: string;
  count: number;
  nps: number | null;
  meanScore: number | null;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface DashboardData {
  meta: {
    slug: string;
    name: string;
    shortName: string;
    npsScale: ClientConfig['npsScale'];
    npsTitle: string;
    generatedAt: string;
    source: 'tally' | 'fixture';
    totalSubmissions: number;
    countedResponses: number;
    excludedNoNps: number;
    warning?: string;
  };
  nps: NpsSummary | null;
  overallMean: number | null;
  overallMeanCount: number;
  stages: StageScore[];
  items: ItemScore[];
  distribution: DistributionPoint[];
  correlations: CorrelationResult[];
  comments: CommentView[];
  serviceBreakdown: ServiceBreakdown[];
  respondentBreakdown: { label: string; count: number }[];
  dailyTrend: { date: string; count: number; nps: number | null }[];
  filters: {
    from: string | null;
    to: string | null;
    service: string | null;
  };
  availableServices: string[];
}

export function categorizeNps(value: number, scale: ClientConfig['npsScale']): NpsCategory {
  if (scale === '1-5') {
    if (value >= 5) return 'promoter';
    if (value === 4) return 'passive';
    return 'detractor';
  }
  if (value >= 9) return 'promoter';
  if (value >= 7) return 'passive';
  return 'detractor';
}

export const mean = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

/** Pearson r; null bila varians nol atau data kurang. */
export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 5) return null;
  const mx = mean(xs);
  const my = mean(ys);
  if (mx === null || my === null) return null;

  let numerator = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    numerator += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return numerator / Math.sqrt(dx * dy);
}

export function strengthOf(r: number | null): CorrelationResult['strength'] {
  if (r === null) return 'None';
  const abs = Math.abs(r);
  if (abs >= 0.7) return 'Very Strong';
  if (abs >= 0.5) return 'Strong';
  if (abs >= 0.3) return 'Moderate';
  if (abs >= 0.1) return 'Weak';
  return 'None';
}

function recommendationOf(strength: CorrelationResult['strength'], r: number | null): string {
  if (r === null) return 'Not enough data for analysis';
  if (strength === 'Very Strong') return 'Primary driver of loyalty';
  if (strength === 'Strong') return 'Top priority for improvement';
  if (strength === 'Moderate') return 'Supporting factor of the experience';
  if (strength === 'Weak') return 'Service standard compliance';
  return 'No visible impact on loyalty';
}

export function stageScoreOf(scores: Partial<Record<QuestionKey, number>>, questions: QuestionKey[]): number | null {
  const values = questions.map((question) => scores[question]).filter((value): value is number => typeof value === 'number');
  return mean(values);
}

export interface BuildOptions {
  client: ClientConfig;
  responses: SurveyResponse[];
  source: 'tally' | 'fixture';
  totalSubmissions: number;
  filters: { from: string | null; to: string | null; service: string | null };
  availableServices: string[];
  /** Tahap layanan; default STAGES bila form tidak memakai Heading. */
  stages?: StageDef[];
  warning?: string;
}

export function buildDashboard(options: BuildOptions): DashboardData {
  const { client, responses, filters } = options;
  const stageDefs = options.stages && options.stages.length > 0 ? options.stages : STAGES;

  const withNps = responses.filter((response) => response.nps !== null);
  const npsValues = withNps.map((response) => response.nps as number);

  let nps: NpsSummary | null = null;
  if (npsValues.length > 0) {
    const categories = npsValues.map((value) => categorizeNps(value, client.npsScale));
    const promoters = categories.filter((category) => category === 'promoter').length;
    const passives = categories.filter((category) => category === 'passive').length;
    const detractors = categories.filter((category) => category === 'detractor').length;
    const total = npsValues.length;

    nps = {
      total,
      promoters,
      passives,
      detractors,
      promoterPct: round1((promoters / total) * 100),
      passivePct: round1((passives / total) * 100),
      detractorPct: round1((detractors / total) * 100),
      score: round1(((promoters - detractors) / total) * 100),
    };
  }

  // Skor rata-rata per tahap.
  const stages: StageScore[] = [];
  for (const stage of stageDefs) {
    const questionValues: number[] = [];
    let answeredRespondents = 0;
    for (const response of responses) {
      const value = stageScoreOf(response.scores, stage.questions);
      if (value !== null) {
        questionValues.push(value);
        answeredRespondents++;
      }
    }
    const stageMean = mean(questionValues);
    if (stage.optional && answeredRespondents === 0) continue;
    if (!stage.optional && answeredRespondents === 0 && responses.length === 0) {
      stages.push({
        key: stage.key,
        label: stage.label,
        shortLabel: stage.shortLabel,
        score: null,
        responses: 0,
        optional: Boolean(stage.optional),
      });
      continue;
    }
    stages.push({
      key: stage.key,
      label: stage.label,
      shortLabel: stage.shortLabel,
      score: stageMean === null ? null : round2(stageMean),
      responses: answeredRespondents,
      optional: Boolean(stage.optional),
    });
  }

  // Rata-rata keseluruhan dihitung dari semua butir skala yang dijawab.
  const allItems: number[] = [];
  for (const response of responses) {
    for (const value of Object.values(response.scores)) {
      if (typeof value === 'number') allItems.push(value);
    }
  }
  const overallMean = mean(allItems);

  // Korelasi per tahap dengan skor NPS.
  const correlations: CorrelationResult[] = [];
  const distribution = buildDistribution(npsValues, client.npsScale);
  const items = buildItems(responses, stageDefs);
  for (const stageDef of stageDefs) {
    const stage = stages.find((item) => item.key === stageDef.key);
    if (!stage) continue;
    const xs: number[] = [];
    const ys: number[] = [];
    for (const response of withNps) {
      const stageValue = stageScoreOf(response.scores, stageDef.questions);
      if (stageValue === null || response.nps === null) continue;
      xs.push(stageValue);
      ys.push(response.nps);
    }
    const r = pearson(xs, ys);
    const strength = strengthOf(r);
    correlations.push({
      key: stage.key,
      label: stage.label,
      shortLabel: stage.shortLabel,
      score: stage.score,
      r: r === null ? null : round3(r),
      n: xs.length,
      strength,
      recommendation: recommendationOf(strength, r),
      rank: 0,
    });
  }

  correlations.sort((a, b) => (b.r ?? -2) - (a.r ?? -2));
  correlations.forEach((item, index) => {
    item.rank = index + 1;
  });

  const comments: CommentView[] = responses
    .flatMap((response) =>
      response.comments.map((comment) => ({
        id: response.id,
        submittedAt: response.submittedAt,
        label: comment.label,
        stageKey: comment.stageKey,
        stageLabel: stageLabelOf(comment.stageKey, stageDefs),
        text: comment.text,
        respondentType: response.respondentType,
        serviceType: response.serviceType,
      })),
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const serviceMap = new Map<string, SurveyResponse[]>();
  for (const response of responses) {
    const key = response.serviceType || 'Tidak disebutkan';
    const list = serviceMap.get(key) ?? [];
    list.push(response);
    serviceMap.set(key, list);
  }
  const serviceBreakdown: ServiceBreakdown[] = [...serviceMap.entries()]
    .map(([label, list]) => {
      const values = list.map((item) => item.nps).filter((value): value is number => value !== null);
      const categories = values.map((value) => categorizeNps(value, client.npsScale));
      const promoters = categories.filter((category) => category === 'promoter').length;
      const passives = categories.filter((category) => category === 'passive').length;
      const detractors = categories.filter((category) => category === 'detractor').length;
      const itemValues: number[] = [];
      for (const response of list) {
        for (const value of Object.values(response.scores)) {
          if (typeof value === 'number') itemValues.push(value);
        }
      }
      return {
        label,
        count: list.length,
        nps: values.length ? round1(((promoters - detractors) / values.length) * 100) : null,
        meanScore: itemValues.length ? round2(mean(itemValues) as number) : null,
        promoters,
        passives,
        detractors,
      };
    })
    .sort((a, b) => b.count - a.count);

  const respondentMap = new Map<string, number>();
  for (const response of responses) {
    const key = response.respondentType || 'Tidak disebutkan';
    respondentMap.set(key, (respondentMap.get(key) ?? 0) + 1);
  }
  const respondentBreakdown = [...respondentMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const dailyTrend = buildTrend(withNps, client);

  // Daftar tahap dipakai juga oleh panel Detail Butir untuk penanda grup.
  const stageLabels = new Map(stageDefs.map((stage) => [stage.key, stage.shortLabel]));
  for (const item of items) {
    if (item.stageKey) item.stageLabel = stageLabels.get(item.stageKey) ?? item.stageLabel;
  }

  return {
    meta: {
      slug: client.slug,
      name: client.name,
      shortName: client.shortName,
      npsScale: client.npsScale,
      npsTitle: client.npsTitle,
      generatedAt: new Date().toISOString(),
      source: options.source,
      totalSubmissions: options.totalSubmissions,
      countedResponses: responses.length,
      excludedNoNps: responses.length - withNps.length,
      warning: options.warning,
    },
    nps,
    overallMean: overallMean === null ? null : round2(overallMean),
    overallMeanCount: allItems.length,
    stages,
    items,
    distribution,
    correlations,
    comments,
    serviceBreakdown,
    respondentBreakdown,
    dailyTrend,
    filters,
    availableServices: options.availableServices,
  };
}

function buildTrend(responses: SurveyResponse[], client: ClientConfig) {
  const map = new Map<string, number[]>();
  for (const response of responses) {
    const date = response.submittedAt.slice(0, 10) || 'unknown';
    const list = map.get(date) ?? [];
    if (response.nps !== null) list.push(response.nps);
    map.set(date, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => ({
      date,
      count: values.length,
      nps: values.length
        ? round1(
            ((values.filter((value) => categorizeNps(value, client.npsScale) === 'promoter').length -
              values.filter((value) => categorizeNps(value, client.npsScale) === 'detractor').length) /
              values.length) *
              100,
          )
        : null,
    }));
}

function buildDistribution(values: number[], scale: ClientConfig['npsScale']): DistributionPoint[] {
  const min = scale === '1-5' ? 1 : 0;
  const max = scale === '1-5' ? 5 : 10;
  const points: DistributionPoint[] = [];
  for (let value = min; value <= max; value++) {
    points.push({
      value,
      count: values.filter((item) => item === value).length,
      category: categorizeNps(value, scale),
    });
  }
  return points;
}

const ITEM_STAGE: Record<string, string> = {
  parkir: 'kedatangan',
  satpam: 'kedatangan',
  pendaftaran: 'pendaftaran',
  tungguDokter: 'pemeriksaan',
  pemeriksaanDokter: 'pemeriksaan',
  kasir: 'kasirFarmasi',
  obat: 'kasirFarmasi',
  farmasi: 'kasirFarmasi',
  kamar: 'kamarInap',
  fasilitasUmum: 'fasilitasUmum',
};

function buildItems(responses: SurveyResponse[], stageDefs: StageDef[]): ItemScore[] {
  const stageOfItem = new Map<QuestionKey, string>();
  for (const stage of stageDefs) {
    for (const question of stage.questions) stageOfItem.set(question, stage.key);
  }

  return QUESTIONS.map((question) => {
    const values = responses
      .map((response) => response.scores[question.key])
      .filter((value): value is number => typeof value === 'number');
    return {
      key: question.key,
      label: question.label,
      score: values.length ? round2(mean(values) as number) : null,
      responses: values.length,
      stageKey: stageOfItem.get(question.key) ?? ITEM_STAGE[question.key] ?? null,
    };
  }).filter((item) => item.responses > 0);
}

function stageLabelOf(stageKey: string | null, stageDefs: StageDef[] = STAGES): string {
  if (!stageKey) return 'Umum';
  return stageDefs.find((stage) => stage.key === stageKey)?.label ?? 'Umum';
}

export const round1 = (value: number) => Math.round(value * 10) / 10;
export const round2 = (value: number) => Math.round(value * 100) / 100;
export const round3 = (value: number) => Math.round(value * 1000) / 1000;
