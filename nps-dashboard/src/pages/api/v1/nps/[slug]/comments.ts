import type { APIRoute } from 'astro';
import { apiError, guard, isResponse, json, methodNotAllowed, preflight } from '../../../../../lib/api';

export const prerender = false;

/** GET /api/v1/nps/{slug}/comments — komentar pasien saja. */
export const GET: APIRoute = async ({ request, params, url }) => {
  const auth = await guard(request);
  if (isResponse(auth)) return auth;

  const slug = params.slug ?? '';
  if (auth.key.slug && auth.key.slug !== slug) {
    return apiError(403, 'forbidden', 'This API key is not allowed to read this client.');
  }

  const { loadDashboard } = await import('../../../../../lib/data');
  const result = await loadDashboard(slug, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    service: url.searchParams.get('service'),
  });

  if (!result) return apiError(404, 'client_not_found', `No client with slug "${slug}".`);

  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 50) || 50));
  const comments = result.data.comments.slice(0, limit).map((comment) => ({
    submittedAt: comment.submittedAt,
    stage: comment.stageLabel,
    service: comment.serviceType,
    respondentType: comment.respondentType,
    text: comment.text,
  }));

  return json(
    { data: comments, meta: { count: comments.length, total: result.data.comments.length, remainingQuota: auth.remaining } },
    200,
    { 'x-ratelimit-remaining': String(auth.remaining) },
  );
};

/* API read-only: metode lain ditolak. */
export const OPTIONS: APIRoute = () => preflight();
export const ALL: APIRoute = () => methodNotAllowed();
