import type { QuestionKey } from './config';

export interface CommentRecord {
  label: string;
  stageKey: string | null;
  text: string;
}

export interface SurveyResponse {
  id: string;
  submittedAt: string;
  scores: Partial<Record<QuestionKey, number>>;
  nps: number | null;
  respondentType: string;
  serviceType: string;
  staff: string;
  doctor: string;
  comments: CommentRecord[];
}
