import { QUESTIONS } from './config';
import { buildSyncResult } from './form-sync';
import { fetchFormBlueprint } from './tally';

/**
 * Baca form Tally dan hasilkan daftar tahap + pertanyaan siap diedit admin.
 * Dipakai halaman sinkronisasi client baru.
 */
export async function syncFormStructure(apiKey: string, formId: string) {
  const blueprint = await fetchFormBlueprint(apiKey, formId);
  const result = buildSyncResult(
    blueprint,
    QUESTIONS.map((question) => ({ label: question.label, titleKeywords: question.titleKeywords })),
    ['merekomendasikan'],
  );

  return {
    ...result,
    unknownCount: result.questions.filter((question) => question.isScore && !question.guessedLabel).length,
  };
}
