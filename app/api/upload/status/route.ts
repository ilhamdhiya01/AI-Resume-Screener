import { NextRequest } from 'next/server';

import { resumeQueue } from '@/lib/queue';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return errorResponse(`resumeId is required`, 404);
    }

    const jobs = await resumeQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
    ]);
    const job = jobs.find((j) => j.data.resumeId === resumeId);

    if (!job) {
      return successResponse('Job not found', {
        status: 'NOT_FOUND',
        progress: 0,
      });
    }

    const state = await job.getState();
    const progressData = job.progress;
    const progressValue =
      typeof progressData === 'object' && progressData !== null
        ? (progressData as { progress: number }).progress
        : (progressData as number) || 0;

    const step =
      typeof progressData === 'object' && progressData !== null
        ? (progressData as { step: string }).step
        : state;

    return successResponse('Job status retrieved', {
      jobId: job.id,
      status: state, // 'active' | 'completed' | 'failed' | 'waiting'
      progress: progressValue, // 0-100
      step: step,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    return errorResponse('Failed to get job status', 500);
  }
};
