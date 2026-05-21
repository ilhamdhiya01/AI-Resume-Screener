import { Prisma } from '@/app/generated/prisma/client';

export type AnalysisResultPayload = Omit<
  Prisma.AnalysisResultCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'resume'
> & {
  resumeId: string;
};
