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

export type ResumeJobStatus = {
  status:
    | 'idle'
    | 'active'
    | 'waiting'
    | 'delayed'
    | 'paused'
    | 'completed'
    | 'failed';
  progress: number;
  jobId?: string;
  step?:
    | 'extracting_text_metadata'
    | 'analyzing_competencies'
    | 'mapping_timeline'
    | 'calculating_score'
    | 'completed'
    | 'failed'
    | 'unknown';
  durations?: Record<string, number>;
  completedSteps?: string[];
  data?: ResumeData;
  failedReason?: string | null;
  isCancelled?: boolean;
};

export type ResumeAnalysisResult = {
  score: number | null;
};
