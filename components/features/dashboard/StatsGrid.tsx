import React from 'react';

import { Role } from '@/app/generated/prisma/enums';
import { RoleGuard } from '@/components/shared/role-guard';
import { type IconName } from '@/components/ui/icon';
import {
  CreditInfo,
  DashboardStats,
  StatTrend,
} from '@/lib/types/dashboard.types';

import RemainingCreditsCard from './RemainingCreditsCard';
import StatsCard from './StatsCard';

interface StatsGridProps {
  stats: DashboardStats;
  role: Role;
  creditInfo?: CreditInfo;
}

type StatItem = {
  label: string;
  value: string;
  icon: IconName;
  iconClassName: string;
  trend: StatTrend;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

const StatsGrid = ({ stats, role, creditInfo }: StatsGridProps) => {
  const items: StatItem[] = [
    {
      label: 'Total Resumes Analyzed',
      value: formatNumber(stats.totalResumes.value),
      icon: 'TbFileText',
      iconClassName: 'bg-blue-100 text-blue-600',
      trend: stats.totalResumes.trend,
    },
    {
      label: 'Avg. Match Score',
      value: `${stats.averageScore.value}%`,
      icon: 'TbChartBar',
      iconClassName: 'bg-emerald-100 text-emerald-600',
      trend: stats.averageScore.trend,
    },
    {
      label: 'Analyses This Week',
      value: formatNumber(stats.analysesThisWeek.value),
      icon: 'TbCalendarWeek',
      iconClassName: 'bg-amber-100 text-amber-600',
      trend: stats.analysesThisWeek.trend,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatsCard key={item.label} {...item} />
      ))}

      <RoleGuard role={role} allow="ADMIN">
        <StatsCard
          label="Registered Users"
          value={formatNumber(stats.registeredUsers.value)}
          icon="TbUsers"
          iconClassName="bg-indigo-100 text-indigo-600"
          trend={stats.registeredUsers.trend}
        />
      </RoleGuard>

      <RoleGuard role={role} allow="FREE">
        {creditInfo && <RemainingCreditsCard creditInfo={creditInfo} />}
      </RoleGuard>
    </div>
  );
};

export default StatsGrid;
