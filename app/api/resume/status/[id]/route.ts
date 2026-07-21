import { Job } from 'bullmq';
import { NextRequest } from 'next/server';

import prisma from '@/lib/db';
import { resumeQueue } from '@/lib/queue';
import { cancelSpecificJob, retrySpecificJob } from '@/lib/queue/resume-worker';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { getSignedUrl } from '@/services/server/upload.service';

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

    // Handle action dulu jika ada
    if (isRetry) {
      try {
        const result = await retrySpecificJob(id);
        return successResponse('Job retried', result);
      } catch (error: unknown) {
        return errorResponse(
          (error as Error).message ?? 'Failed to retry job',
          400
        );
      }
    }

    if (isCancel) {
      try {
        const result = await cancelSpecificJob(id);
        return successResponse('Job cancel result', result);
      } catch (error: unknown) {
        return errorResponse(
          (error as Error).message ?? 'Failed to cancel job',
          400
        );
      }
    }

    //  Query Resume first (always exists)
    const resume = await prisma.resume.findUnique({
      where: {
        id,
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

    // Direct lookup by ID (1 HGETALL) instead of getJobs() (N commands)
    const job = await Job.fromId(resumeQueue, id);

    if (!job) {
      // Job expired dari Redis queue — fallback ke DB jika sudah completed.
      // BullMQ membersihkan completed jobs setelah TTL/restart, tapi
      // analysisResult tetap tersimpan permanen di Prisma.
      if (resume.status === 'COMPLETED') {
        const analysisData = await prisma.analysisResult.findUnique({
          where: { resumeId: id },
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

        const fileUrl = await getSignedUrl(resume.filePath);

        return successResponse('Job status retrieved', {
          status: 'completed',
          progress: 100,
          step: 'completed',
          durations: {},
          completedSteps: [
            'extracting_text_metadata',
            'analyzing_competencies',
            'mapping_timeline',
            'calculating_score',
          ],
          failedReason: null,
          isCancelled: false,
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
      }

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
      where: { resumeId: id },
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
          resumeId: id,
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
    console.error('Error handling job:', error);
    return errorResponse('Failed to handle job', 500);
  }
};
