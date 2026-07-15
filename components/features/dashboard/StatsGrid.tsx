import React from 'react';

import { type IconName } from '@/components/ui/icon';
import { DashboardStats, StatTrend } from '@/lib/types/dashboard.types';

import StatsCard from './StatsCard';

interface StatsGridProps {
  stats: DashboardStats;
}

type StatItem = {
  label: string;
  value: string;
  icon: IconName;
  trend: StatTrend;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

const StatsGrid = ({ stats }: StatsGridProps) => {
  const items: StatItem[] = [
    {
      label: 'Total Resumes Analyzed',
      value: formatNumber(stats.totalResumes.value),
      icon: 'TbFileText',
      trend: stats.totalResumes.trend,
    },
    {
      label: 'Avg. Match Score',
      value: `${stats.averageScore.value}%`,
      icon: 'TbChartBar',
      trend: stats.averageScore.trend,
    },
    {
      label: 'Analyses This Week',
      value: formatNumber(stats.analysesThisWeek.value),
      icon: 'TbCalendarWeek',
      trend: stats.analysesThisWeek.trend,
    },
    {
      label: 'Registered Users',
      value: formatNumber(stats.registeredUsers.value),
      icon: 'TbUsers',
      trend: stats.registeredUsers.trend,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatsCard key={item.label} {...item} />
      ))}
    </div>
  );
};

export default StatsGrid;
