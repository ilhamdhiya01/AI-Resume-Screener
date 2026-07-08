import type { UploadStatus } from '@/app/generated/prisma/enums';

import { ResumeAnalysisResult } from './resume-analysis.types';

export type ResumeHistoryFilters = Partial<{
  page: number;
  limit: number;
  status: UploadStatus;
  search: string;
  dateFrom: string;
  dateTo: string;
}>;

export type ResumeHistoryItem = {
  id: string;
  fileName: string;
  filePath: string;
  status: UploadStatus;
  createdAt: Date;
  analysis?: ResumeAnalysisResult | null;
};
