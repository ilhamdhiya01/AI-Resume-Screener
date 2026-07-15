import type { Role } from '@/app/generated/prisma/enums';

/**
 * Trend direction and value shown on each stat card.
 */
export type StatTrend = {
  value: number;
  direction: 'up' | 'down' | 'stable';
  label: string;
  context: string;
};

/**
 * Aggregated dashboard metrics.
 */
export type DashboardStats = {
  totalResumes: {
    value: number;
    trend: StatTrend;
  };
  averageScore: {
    value: number;
    trend: StatTrend;
  };
  analysesThisWeek: {
    value: number;
    trend: StatTrend;
  };
  registeredUsers: {
    value: number;
    trend: StatTrend;
  };
};

/**
 * A single recent analysis item shown in the dashboard list.
 */
export type RecentAnalysisItem = {
  id: string;
  fileName: string;
  fileType: string;
  role: string | null;
  score: number;
  createdAt: Date;
};

/**
 * Resume score distribution buckets.
 */
export type ScoreDistribution = {
  high: number;
  medium: number;
  low: number;
  total: number;
};

/**
 * Complete dashboard payload returned by the service.
 */
export type CreditInfo = {
  used: number;
  limit: number | null;
  role: Role;
};

export type DashboardData = {
  stats: DashboardStats;
  recentAnalyses: RecentAnalysisItem[];
  scoreDistribution: ScoreDistribution;
  creditInfo: CreditInfo;
};

/**
 * Input shape for fetching dashboard data.
 */
export type DashboardInput = {
  userId: string;
  role: Role;
};
