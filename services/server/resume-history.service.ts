import prisma from '@/lib/db';
import { PaginatedResponse } from '@/lib/types/api.types';
import { ResumeHistoryFilters } from '@/lib/types/resume-history.types';
import { ResumeHistoryItem } from '@/lib/types/resume-history.types';

export const getUserResumeHistory = async (
  userId: string,
  filters: ResumeHistoryFilters
): Promise<PaginatedResponse<ResumeHistoryItem>> => {
  const requestedPage = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(100, filters.limit ?? 4));

  const where = {
    userId,
    ...(filters.status && { status: filters.status }),
    ...(filters.search && {
      fileName: {
        contains: filters.search,
        mode: 'insensitive' as const,
      },
    }),
  };

  const total = await prisma.resume.count({ where });
  const totalPages = Math.ceil(total / limit);
  const page = Math.min(requestedPage, totalPages || 1);
  const skip = (page - 1) * limit;

  const items = await prisma.resume.findMany({
    where,
    select: {
      id: true,
      fileName: true,
      filePath: true,
      status: true,
      createdAt: true,
      analysis: {
        select: { score: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    items,
    total,
    page,
    totalPages,
    limit,
  };
};
