import { NextRequest } from 'next/server';

import type { UploadStatus } from '@/app/generated/prisma/enums';
import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { getUserResumeHistory } from '@/services/server/resume-history.service';

const VALID_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;

const parseStatusParam = (value: string | null): UploadStatus | undefined => {
  if (!value || value.toUpperCase() === 'ALL') {
    return undefined;
  }
  const upper = value.toUpperCase();
  return VALID_STATUSES.includes(upper as (typeof VALID_STATUSES)[number])
    ? (upper as UploadStatus)
    : undefined;
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const searchParam = searchParams.get('search');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');

    const session = await auth();

    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const targetUserId = role === 'ADMIN' ? undefined : userId;
    const parsedStatus = parseStatusParam(statusParam);

    const resumes = await getUserResumeHistory(targetUserId, {
      status: parsedStatus,
      page: pageParam,
      search: searchParam || undefined,
      dateFrom: dateFromParam || undefined,
      dateTo: dateToParam || undefined,
    });

    return successResponse('Resume history retrieved', resumes, 200);
  } catch (error) {
    console.error('History error:', error);
    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Failed to retrieve resume history',
      500
    );
  }
};
