import { startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';

import { Prisma } from '@/app/generated/prisma/client';
import { UploadStatus } from '@/app/generated/prisma/enums';
import prisma from '@/lib/db';
import {
  DashboardData,
  DashboardInput,
  RecentAnalysisItem,
  ScoreDistribution,
  StatTrend,
} from '@/lib/types/dashboard.types';

import { getCreditStatus } from './credit.service';

/**
 * Computes a percentage trend between current and previous values.
 */
const computeTrend = (
  current: number,
  previous: number,
  context: string
): StatTrend => {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'stable',
      label: current > 0 ? '+100%' : '0%',
      context,
    };
  }

  const diff = current - previous;
  const percentage = Math.round((diff / previous) * 100);

  if (percentage === 0) {
    return {
      value: 0,
      direction: 'stable',
      label: 'Stable',
      context,
    };
  }

  const direction = percentage > 0 ? 'up' : 'down';

  return {
    value: Math.abs(percentage),
    direction,
    label: `${percentage >= 0 ? '+' : ''}${percentage}%`,
    context,
  };
};

/**
 * Returns current/previous month and week boundaries for trend comparisons.
 */
const getBoundaries = () => {
  const now = new Date();

  const previousMonthStart = startOfMonth(subMonths(now, 1));

  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const previousWeekStart = subWeeks(currentWeekStart, 1);

  return {
    previousMonthStart,
    currentWeekStart,
    previousWeekStart,
  };
};

/**
 * Counts resumes created in the current week vs previous week.
 */
const getAnalysesThisWeek = async (
  resumeWhere: Prisma.ResumeWhereInput,
  previousWeekStart: Date,
  currentWeekStart: Date
): Promise<{ current: number; previous: number }> => {
  const [current, previous] = await Promise.all([
    prisma.resume.count({
      where: {
        ...resumeWhere,
        createdAt: { gte: currentWeekStart },
      },
    }),
    prisma.resume.count({
      where: {
        ...resumeWhere,
        createdAt: { gte: previousWeekStart, lt: currentWeekStart },
      },
    }),
  ]);

  return { current, previous };
};

/**
 * Fetches recent 4 completed analyses with minimal fields.
 */
const getRecentAnalyses = async (
  resumeWhere: Prisma.ResumeWhereInput
): Promise<RecentAnalysisItem[]> => {
  const items = await prisma.resume.findMany({
    where: resumeWhere,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fileName: true,
      fileType: true,
      createdAt: true,
      analysis: {
        select: {
          score: true,
          role: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    fileType: item.fileType,
    role: item.analysis?.role ?? null,
    score: item.analysis?.score ?? 0,
    createdAt: item.createdAt,
  }));
};

/**
 * Computes score distribution buckets using Prisma aggregation.
 */
const getScoreDistribution = async (
  resumeWhere: Prisma.ResumeWhereInput
): Promise<ScoreDistribution> => {
  const analysisWhere: Prisma.AnalysisResultWhereInput = {
    resume: { is: resumeWhere },
  };

  const [high, medium, low, total] = await Promise.all([
    prisma.analysisResult.count({
      where: { ...analysisWhere, score: { gte: 70 } },
    }),
    prisma.analysisResult.count({
      where: { ...analysisWhere, score: { gte: 40, lt: 70 } },
    }),
    prisma.analysisResult.count({
      where: { ...analysisWhere, score: { lt: 40 } },
    }),
    prisma.analysisResult.count({ where: analysisWhere }),
  ]);

  return { high, medium, low, total };
};

/**
 * Retrieves aggregated dashboard data scoped by role.
 *
 * - ADMIN: aggregates across all users and completed resumes.
 * - PRO / FREE: returns only the current user's completed data.
 */
export const getDashboardData = async (
  input: DashboardInput
): Promise<DashboardData> => {
  const { userId, role } = input;
  const isAdmin = role === 'ADMIN';

  const resumeWhere: Prisma.ResumeWhereInput = {
    status: UploadStatus.COMPLETED,
    ...(isAdmin ? {} : { userId }),
  };

  const userWhere: Prisma.UserWhereInput = isAdmin ? {} : { id: userId };

  const { previousMonthStart, currentWeekStart, previousWeekStart } =
    getBoundaries();

  const [
    totalResumes,
    totalResumesPrevious,
    averageScoreResult,
    averageScorePreviousResult,
    analysesWeek,
    registeredUsers,
    registeredUsersPrevious,
    recentAnalyses,
    scoreDistribution,
    creditInfo,
  ] = await Promise.all([
    prisma.resume.count({ where: resumeWhere }),
    prisma.resume.count({
      where: {
        ...resumeWhere,
        createdAt: { lt: previousMonthStart },
      },
    }),
    prisma.analysisResult.aggregate({
      where: { resume: { is: resumeWhere } },
      _avg: { score: true },
    }),
    prisma.analysisResult.aggregate({
      where: {
        resume: { is: resumeWhere },
        createdAt: { lt: currentWeekStart },
      },
      _avg: { score: true },
    }),
    getAnalysesThisWeek(resumeWhere, previousWeekStart, currentWeekStart),
    prisma.user.count({ where: userWhere }),
    prisma.user.count({
      where: {
        ...userWhere,
        createdAt: { lt: currentWeekStart },
      },
    }),
    getRecentAnalyses(resumeWhere),
    getScoreDistribution(resumeWhere),
    getCreditStatus(userId, role),
  ]);

  const averageScore = Math.round(averageScoreResult._avg?.score ?? 0);
  const averageScorePrevious = Math.round(
    averageScorePreviousResult._avg?.score ?? 0
  );

  return {
    stats: {
      totalResumes: {
        value: totalResumes,
        trend: computeTrend(
          totalResumes,
          totalResumesPrevious,
          'from last month'
        ),
      },
      averageScore: {
        value: averageScore,
        trend: computeTrend(averageScore, averageScorePrevious, 'vs last week'),
      },
      analysesThisWeek: {
        value: analysesWeek.current,
        trend: computeTrend(
          analysesWeek.current,
          analysesWeek.previous,
          'vs last week'
        ),
      },
      registeredUsers: {
        value: registeredUsers,
        trend: computeTrend(
          registeredUsers,
          registeredUsersPrevious,
          'vs last week'
        ),
      },
    },
    recentAnalyses,
    scoreDistribution,
    creditInfo,
  };
};
