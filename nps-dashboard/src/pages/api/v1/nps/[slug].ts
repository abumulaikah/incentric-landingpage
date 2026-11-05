import type { APIRoute } from 'astro';
import { apiError, assertClientScope, guard, isResponse, json, methodNotAllowed, preflight } from '../../../../lib/api';
import { resolveClient } from '../../../../lib/resolve-client';
import { loadDashboard } from '../../../../lib/data';

export const prerender = false;

/**
 * GET /api/v1/nps/{slug}
 * Query: from, to, service, detail=summary|full
 */
export const GET: APIRoute = async ({ request, params, url }) => {
  const auth = await guard(request);
  if (isResponse(auth)) return auth;

  const slug = params.slug ?? '';
  const denied = assertClientScope(auth.key, slug);
  if (denied) return denied;

  const client = await resolveClient(slug);
  if (!client) return apiError(404, 'client_not_found', `No client with slug "${slug}".`);

  const result = await loadDashboard(slug, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    service: url.searchParams.get('service'),
  });

  if (!result) return apiError(500, 'load_failed', 'Could not build the dashboard.');

  const data = result.data;
  const detail = url.searchParams.get('detail') ?? 'summary';

  const base = {
    slug: data.meta.slug,
    name: data.meta.name,
    npsScale: data.meta.npsScale,
    period: { from: data.filters.from, to: data.filters.to },
    filters: { service: data.filters.service },
    totalRespondents: data.nps?.total ?? 0,
    nps: data.nps
      ? {
          score: data.nps.score,
          promoters: data.nps.promoters,
          passives: data.nps.passives,
          detractors: data.nps.detractors,
          promoterPct: data.nps.promoterPct,
          passivePct: data.nps.passivePct,
          detractorPct: data.nps.detractorPct,
        }
      : null,
    overallMean: data.overallMean,
    stages: data.stages.map((stage) => ({
      key: stage.key,
      label: stage.label,
      score: stage.score,
      responses: stage.responses,
    })),
    correlations: data.correlations.map((item) => ({
      key: item.key,
      label: item.label,
      score: item.score,
      r: item.r,
      strength: item.strength,
      respondents: item.n,
      recommendation: item.recommendation,
    })),
    updatedAt: data.meta.generatedAt,
  };

  const full = {
    ...base,
    items: data.items.map((item) => ({ key: item.key, label: item.label, score: item.score, responses: item.responses })),
    distribution: data.distribution,
    serviceBreakdown: data.serviceBreakdown,
    respondentBreakdown: data.respondentBreakdown,
    trend: data.dailyTrend,
    comments: data.comments.map((comment) => ({
      submittedAt: comment.submittedAt,
      stage: comment.stageLabel,
      service: comment.serviceType,
      respondentType: comment.respondentType,
      text: comment.text,
    })),
  };

  return json(
    { data: detail === 'full' ? full : base, meta: { remainingQuota: auth.remaining, source: data.meta.source } },
    200,
    { 'x-ratelimit-remaining': String(auth.remaining) },
  );
};

/* API read-only: metode lain ditolak. */
export const OPTIONS: APIRoute = () => preflight();
export const ALL: APIRoute = () => methodNotAllowed();
