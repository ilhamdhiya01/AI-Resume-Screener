import prisma from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PaginatedResponse } from '@/lib/types/api.types';
import { ResumeHistoryFilters } from '@/lib/types/resume-history.types';
import { ResumeHistoryItem } from '@/lib/types/resume-history.types';

/**
 * @description Builds the Prisma where clause from filters.
 * @param {string} userId - The user ID to filter by.
 * @param {ResumeHistoryFilters} filters - The applied filters.
 * @returns {object} Prisma-compatible where clause.
 */
const toEndOfDay = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
};

const buildWhere = (userId: string, filters: ResumeHistoryFilters) => {
  const where: Record<string, unknown> = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.fileName = {
      contains: filters.search,
      mode: 'insensitive' as const,
    };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      (where.createdAt as Record<string, unknown>).gte = new Date(
        filters.dateFrom
      );
    }
    if (filters.dateTo) {
      (where.createdAt as Record<string, unknown>).lte = toEndOfDay(
        filters.dateTo
      );
    }
  }

  return where;
};

export const getUserResumeHistory = async (
  userId: string,
  filters: ResumeHistoryFilters
): Promise<PaginatedResponse<ResumeHistoryItem>> => {
  const requestedPage = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(100, filters.limit ?? 4));
  const where = buildWhere(userId, filters);

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

export const deleteResumeById = async (
  userId: string,
  resumeId: string
): Promise<void> => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { userId: true, filePath: true },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new Error('Forbidden');
  }

  if (resume.filePath) {
    const { error } = await supabaseAdmin.storage
      .from('resumes')
      .remove([resume.filePath]);
    if (error) console.warn('Failed to delete storage file:', error.message);
  }

  await prisma.resume.delete({
    where: { id: resumeId },
  });
};

export const exportResumeHistoryCSV = async (
  userId: string,
  filters: ResumeHistoryFilters
): Promise<Record<string, unknown>[]> => {
  const where = buildWhere(userId, filters);

  const items = await prisma.resume.findMany({
    where,
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      fileType: true,
      status: true,
      createdAt: true,
      analysis: {
        select: { score: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    fileSize: item.fileSize,
    fileType: item.fileType,
    status: item.status,
    score: item.analysis?.score ?? 0,
    createdAt: item.createdAt.toISOString(),
  }));
};
