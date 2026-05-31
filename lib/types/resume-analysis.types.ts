import { Prisma } from '@/app/generated/prisma/client';

export type AnalysisResultPayload = Omit<
  Prisma.AnalysisResultCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'resume'
> & {
  resumeId: string;
};

export type ResumeData = {
  resume: Record<'fileName' | 'filePath', string>;
  summary: string;
  score: number;
  hasTypos: boolean;
  typoCount: number;
  strengths: string[];
  criticals: string[];
  suggestions: string[];
  typoDetails: string[];
  criticalHighlights: { text: string; page: number }[];
  matchSummary?: string;
};
