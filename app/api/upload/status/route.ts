import { Job } from 'bullmq';
import { NextRequest } from 'next/server';

import prisma from '@/lib/db';
import { resumeQueue } from '@/lib/queue';
import { getSignedUrl } from '@/lib/services/upload.service';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return errorResponse(`resumeId is required`, 404);
    }

    // ✅ Query Resume first (always exists)
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      select: {
        fileName: true,
        filePath: true,
        status: true,
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

    const durations =
      typeof progressData === 'object' && progressData !== null
        ? (progressData as { durations?: Record<string, number> }).durations ||
          {}
        : {};

    let analysisData = null;
    let fileUrl = '';

    if (state === 'completed' && progressValue === 100) {
      analysisData = await prisma.analysisResult.findUnique({
        where: {
          resumeId,
        },
        select: {
          atsIssues: true,
          typoCount: true,
          hasTypos: true,
          typoDetails: true,
          atsRecommendations: true,
          summary: true,
          strengths: true,
          criticals: true,
          criticalHighlights: true,
          suggestions: true,
          score: true,
          matchSummary: true,
        },
      });

      fileUrl = await getSignedUrl(resume.filePath);
    }

    return successResponse('Job status retrieved', {
      jobId: job.id,
      status: state,
      progress: progressValue,
      step: step,
      durations: durations,
      data: analysisData
        ? {
            resume: {
              fileName: resume.fileName,
              filePath: fileUrl,
            },
            ...analysisData,
          }
        : null,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    return errorResponse('Failed to get job status', 500);
  }
};
