import type { APIRoute } from 'astro';
import { resolveClient } from '../../lib/resolve-client';
import { isAdmin, sessionCookie, verifySessionToken } from '../../lib/auth';
import { readEnv } from '../../lib/env';
import { clientFormId } from '../../lib/env';
import { fetchFormQuestions, fetchRawSubmissions } from '../../lib/tally';
import { rawCsvFileName, rawSubmissionsToCsv } from '../../lib/csv-raw';

export const prerender = false;

/**
 * Export data mentah bergaya Tally:
 * satu baris per submission, kolom = pertanyaan asli.
 * Mendukung filter tanggal dan layanan.
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get('slug') ?? '';
  const resolved = await resolveClient(slug);
  if (!resolved) return new Response('Client not found', { status: 404 });
  const client = resolved.client;

  const session = await verifySessionToken(cookies.get(sessionCookie.name)?.value);
  const authorized = isAdmin(session) || session?.scopes.includes(client.slug);
  if (!authorized) return new Response('Not authorized', { status: 401 });

  const apiKey = readEnv('TALLY_API_KEY');
  if (!apiKey) return new Response('TALLY_API_KEY is not configured', { status: 500 });

  const formId = clientFormId(client.slug, client.formId);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const service = url.searchParams.get('service');

  try {
    const [questions, submissions] = await Promise.all([
      fetchFormQuestions(apiKey, formId),
      fetchRawSubmissions(apiKey, formId),
    ]);

    // Cari questionId untuk kolom "jenis pelayanan" agar filter layanan akurat.
    const serviceQuestion = questions.find((question) => /jenis pelayanan|service type/i.test(question.title));
    const respondentQuestion = questions.find((question) => /siapakah anda|who are you/i.test(question.title));

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

    void respondentQuestion;

    const csv = rawSubmissionsToCsv({ questions, submissions: filtered, onlyAnswered: true });

    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${rawCsvFileName(client.slug, service)}"`,
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return new Response(`Export failed: ${message}`, { status: 500 });
  }
};
