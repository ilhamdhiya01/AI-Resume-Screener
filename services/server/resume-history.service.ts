import prisma from '@/lib/db';
import { PaginatedResponse } from '@/lib/types/api.types';
import { ResumeHistoryFilters } from '@/lib/types/resume-history.types';
import { ResumeHistoryItem } from '@/lib/types/resume-history.types';

export const getUserResumeHistory = async (
  userId: string,
  filters: ResumeHistoryFilters
): Promise<PaginatedResponse<ResumeHistoryItem>> => {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(100, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(filters.status && { status: filters.status }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.resume.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        status: true,
        createdAt: true,
        analysis: {
          select: { score: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.resume.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
};
