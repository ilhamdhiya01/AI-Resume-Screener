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

    // Bedain cancel (user) vs technical error. Worker throw pesan khusus
    // 'Proses dibatalkan oleh user' saat cancel, jadi bisa dideteksi via regex.
    const failedReason = state === 'failed' ? job.failedReason : undefined;
    const isCancelled =
      state === 'failed' && /dibatalkan|cancel/i.test(failedReason || '');

    // Checkpoint = progress AI yang udah tersimpan dari run sebelumnya.
    // Dipakai biar UI bisa nampilin step yang udah kelar (centang hijau)
    // langsung saat resume/retry tanpa nunggu worker jalan ulang.
    const checkpoint = await prisma.analysisCheckpoint.findUnique({
      where: { resumeId },
      select: {
        extractionResult: true,
        scoringResult: true,
        synthesisResult: true,
        durations: true,
      },
    });

    // Derive step mana yang udah beres dari hasil yang tersimpan.
    const completedSteps: string[] = [];
    if (checkpoint) {
      completedSteps.push('extracting_text_metadata');
      if (checkpoint.extractionResult)
        completedSteps.push('analyzing_competencies');
      if (checkpoint.scoringResult) completedSteps.push('mapping_timeline');
      if (checkpoint.synthesisResult) completedSteps.push('calculating_score');
    }

    // Gabungkan durasi dari job progress (live) dengan checkpoint (persisted).
    const checkpointDurations =
      (checkpoint?.durations as Record<string, number>) || {};
    const mergedDurations = { ...checkpointDurations, ...durations };

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
      durations: mergedDurations,
      completedSteps,
      failedReason: failedReason || null,
      isCancelled,
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
