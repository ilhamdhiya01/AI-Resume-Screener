import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { deleteResumeById } from '@/services/server/resume-history.service';

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    await deleteResumeById(userId, id);

    return successResponse('Resume deleted successfully', null, 200);
  } catch (error) {
    console.error('Delete resume error:', error);

    const statusCode =
      error instanceof Error && error.message === 'Forbidden' ? 403 : 500;

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete resume',
      statusCode
    );
  }
};
