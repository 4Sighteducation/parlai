import type { ContextCategory } from "@/lib/types/database";

export type DifficultyRead = "too_easy" | "about_right" | "too_hard";

export type AnalysisError = {
  mistake: string;
  correction: string;
  note: string;
};

export type AnalysisVocab = {
  italian: string;
  english: string;
};

export type HarvestProposal = {
  category: ContextCategory;
  label: string;
  detail: string;
  tags: string[];
};

export type SessionAnalysisResult = {
  errors: AnalysisError[];
  new_vocab: AnalysisVocab[];
  difficulty_read: DifficultyRead;
  suggested_focus: string;
  harvest_proposals: HarvestProposal[];
};

export type DebriefData = {
  sessionId: string;
  errors: AnalysisError[];
  new_vocab: AnalysisVocab[];
  suggested_focus: string;
  difficulty_read: DifficultyRead | null;
  analysisFailed?: boolean;
};
