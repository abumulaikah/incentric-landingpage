import type { APIRoute } from 'astro';
import { apiError, assertClientScope, guard, isResponse, methodNotAllowed, preflight } from '../../../../../lib/api';
import { loadDashboard } from '../../../../../lib/data';
import { csvFileName, dashboardToCsv } from '../../../../../lib/csv-export';
import { rawCsvFileName, rawSubmissionsToCsv } from '../../../../../lib/csv-raw';
import { clientFormId, readEnv } from '../../../../../lib/env';
import { resolveClient } from '../../../../../lib/resolve-client';
import { fetchFormQuestions, fetchRawSubmissions, TallyError } from '../../../../../lib/tally';

export const prerender = false;

/**
 * GET /api/v1/nps/{slug}/export
 * Query: from, to, service, format=raw|summary (default summary)
 * raw  = data mentah bergaya export Tally
 * summary = laporan ringkasan NPS
 */
export const GET: APIRoute = async ({ request, params, url }) => {
  const auth = await guard(request);
  if (isResponse(auth)) return auth;

  const slug = params.slug ?? '';
  const denied = assertClientScope(auth.key, slug);
  if (denied) return denied;

  const resolved = await resolveClient(slug);
  if (!resolved) return apiError(404, 'client_not_found', `No client with slug "${slug}".`);
  const client = resolved.client;

  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const service = url.searchParams.get('service');
  const format = url.searchParams.get('format') ?? 'summary';

  if (format === 'raw') {
    const apiKey = readEnv('TALLY_API_KEY');
    if (!apiKey) return apiError(500, 'configuration_error', 'TALLY_API_KEY is not configured.');

    try {
      const formId = clientFormId(client.slug, client.formId);
      const [questions, submissions] = await Promise.all([
        fetchFormQuestions(apiKey, formId),
        fetchRawSubmissions(apiKey, formId),
      ]);

      const serviceQuestion = questions.find((question) => /jenis pelayanan|service type/i.test(question.title));
      const filtered = submissions.filter((submission) => {
        const date = submission.submittedAt.slice(0, 10);
        if (from && date < from) return false;
        if (to && date > to) return false;
        if (service && serviceQuestion) {
          const value = submission.answers[serviceQuestion.id];
          const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
          if (!text.includes(service)) return false;
        }
        return true;
      });

      return new Response(rawSubmissionsToCsv({ questions, submissions: filtered, onlyAnswered: true }), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="${rawCsvFileName(client.slug, service)}"`,
          'cache-control': 'no-store',
          'x-ratelimit-remaining': String(auth.remaining),
        },
      });
    } catch (error) {
      const message = error instanceof TallyError ? error.message : 'Export failed';
      return apiError(502, 'export_failed', message);
    }
  }

  const result = await loadDashboard(slug, { from, to, service });
  if (!result) return apiError(500, 'load_failed', 'Could not build the export.');

  return new Response(dashboardToCsv(result.data), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFileName(result.data)}"`,
      'cache-control': 'no-store',
      'x-ratelimit-remaining': String(auth.remaining),
    },
  });
};

/* API read-only: metode lain ditolak. */
export const OPTIONS: APIRoute = () => preflight();
export const ALL: APIRoute = () => methodNotAllowed();
