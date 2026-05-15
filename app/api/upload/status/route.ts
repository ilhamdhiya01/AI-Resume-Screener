import { Job } from 'bullmq';
import { NextRequest } from 'next/server';

import prisma from '@/lib/db';
import { resumeQueue } from '@/lib/queue';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return errorResponse(`resumeId is required`, 404);
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      select: {
        fileName: true,
      },
    });

    if (!resume) {
      return errorResponse('Resume not found', 404);
    }

    // ✅ Direct lookup by ID (1 HGETALL) instead of getJobs() (N commands)
    const job = await Job.fromId(resumeQueue, resumeId);

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

    console.log({ job });

    return successResponse('Job status retrieved', {
      jobId: job.id,
      status: state,
      progress: progressValue,
      step: step,
      fileName: resume.fileName,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    return errorResponse('Failed to get job status', 500);
  }
};
