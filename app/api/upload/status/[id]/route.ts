import { NextRequest } from 'next/server';

import { cancelSpecificJob, retrySpecificJob } from '@/lib/queue/resume-worker';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;

    const isRetry = searchParams.get('retry');
    const isCancel = searchParams.get('cancel');

    if (!id) {
      return errorResponse('ID is required', 400);
    }

    let result;
    if (isRetry) {
      result = await retrySpecificJob(id);
    }

    if (isCancel) {
      console.log('cancel from server');
      result = await cancelSpecificJob(id);
    }
    return successResponse('Job handled successfully', result);
  } catch (error) {
    console.error('Error handling job:', error);
    return errorResponse('Failed to handle job', 500);
  }
};
