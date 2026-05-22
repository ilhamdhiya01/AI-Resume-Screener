import { NextRequest, NextResponse } from 'next/server';

import { retrySpecificJob } from '@/lib/queue/resume-worker';
import { errorResponse } from '@/lib/utils/api-response';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const result = await retrySpecificJob(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error retrying job:', error);
    return errorResponse('Failed to retry job', 500);
  }
};
