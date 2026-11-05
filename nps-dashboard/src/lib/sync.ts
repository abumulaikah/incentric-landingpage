import { QUESTIONS } from './config';
import { buildSyncResult, guessLabel } from './form-sync';
import { loadCatalog } from './catalog';
import { fetchFormBlueprint } from './tally';

/**
 * Baca form Tally dan hasilkan daftar tahap + pertanyaan siap diedit admin.
 * Katalog label (bawaan + tambahan admin) dipakai untuk menebak label awal.
 */
export async function syncFormStructure(apiKey: string, formId: string) {
  const blueprint = await fetchFormBlueprint(apiKey, formId);
  const catalog = await loadCatalog();

  const result = buildSyncResult(
    blueprint,
    catalog.map((entry) => ({ label: entry.label, titleKeywords: entry.titleKeywords })),
    ['merekomendasikan'],
  );

  return {
    ...result,
    unknownCount: result.questions.filter((question) => question.isScore && !question.guessedLabel).length,
  };
}

export { QUESTIONS, guessLabel };

