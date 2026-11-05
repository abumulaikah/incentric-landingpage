import type { ClientConfig, QuestionKey, StageDef } from './config';
import { CLIENT_META } from './config';
import { parseStageTag } from './normalize';
import type { FormBlock } from './normalize';

export interface SyncQuestion {
  questionId: string;
  title: string;
  label: string;
  stageKey: string | null;
  isScore: boolean;
  isNps: boolean;
  guessedLabel: string | null;
}

export interface SyncResult {
  stages: { key: string; label: string }[];
  questions: SyncQuestion[];
}

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
const stripNumbering = (value: string) => value.replace(/^\s*\d+\s*[.)]\s*/, '').trim();

const isScoreTitle = (title: string) => /^(\d+[.)]\s*)?seberapa\s+(puas|besar)/i.test(title.trim());
const isCommentTitle = (title: string) => /^(apa keluhan|keluhan|masukan|saran|kritik)/i.test(title.trim());

/** Tebak label ringkas dari katalog; null bila belum dikenal. */
export function guessLabel(title: string, catalog: { label: string; titleKeywords: string[] }[]): string | null {
  const haystack = normalize(stripNumbering(title));
  let best: { label: string; weight: number } | null = null;
  for (const entry of catalog) {
    for (const keyword of entry.titleKeywords) {
      if (haystack.includes(normalize(keyword))) {
        const weight = normalize(keyword).length;
        if (!best || weight > best.weight) best = { label: entry.label, weight };
      }
    }
  }
  return best?.label ?? null;
}

/**
 * Baca form Tally menjadi daftar tahap + pertanyaan yang bisa diedit di admin.
 * Pertanyaan skor yang sudah dikenal katalog diberi label otomatis.
 */
export function buildSyncResult(
  blueprint: FormBlock[],
  catalog: { label: string; titleKeywords: string[] }[],
  npsKeywords: string[],
): SyncResult {
  const stages: { key: string; label: string }[] = [];
  const questions: SyncQuestion[] = [];
  let currentStage: string | null = null;
  let position = 0;

  for (const block of blueprint) {
    const title = stripHtml(block.title);

    if (/^HEADING/i.test(block.type)) {
      if (!title) continue;
      const tagged = parseStageTag(title);
      const displayTitle = title.replace(/\s*\[\[\s*stage\s*:[^\]]+\]\]/i, '').trim();
      const key = tagged ?? normalize(displayTitle).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (['perkenalan', 'introduction', 'nps'].includes(key)) {
        currentStage = null;
        continue;
      }
      if (!stages.some((stage) => stage.key === key)) {
        stages.push({ key, label: displayTitle });
      }
      currentStage = key;
      continue;
    }

    if (block.type !== 'TITLE' || !block.questionId) continue;
    const cleanTitle = stripHtml(title);
    const isNps = npsKeywords.some((keyword) => normalize(cleanTitle).includes(normalize(keyword)));
    const isScore = !isNps && isScoreTitle(cleanTitle) && !isCommentTitle(cleanTitle);

    questions.push({
      questionId: block.questionId,
      title: cleanTitle,
      label: guessLabel(cleanTitle, catalog) ?? stripNumbering(cleanTitle).slice(0, 40),
      stageKey: currentStage,
      isScore,
      isNps,
      guessedLabel: guessLabel(cleanTitle, catalog),
    });
    position++;
  }

  return { stages, questions };
}

export { CLIENT_META };
export type { ClientConfig, QuestionKey, StageDef };
