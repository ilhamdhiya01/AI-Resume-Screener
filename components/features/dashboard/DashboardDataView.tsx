'use client';

import React from 'react';

import { useDashboard } from '@/lib/hooks/dashboard/useDashboard';

import DashboardSkeleton from './DashboardSkeleton';
import RecentAnalyses from './RecentAnalyses';
import ScoreDistribution from './ScoreDistribution';
import StatsGrid from './StatsGrid';
import UpgradeBanner from './UpgradeBanner';

const DashboardDataView = () => {
  const { data, isPending, isError } = useDashboard();

  if (isPending) {
    return <DashboardSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <section className="p-8 text-sm text-slate-600">
        Unable to load dashboard. Please try again later.
      </section>
    );
  }

  const dashboardData = data.data;
  const { creditInfo } = dashboardData;
  const isFree = creditInfo.role === 'FREE';

  return (
    <div className="flex flex-col gap-6">
      {isFree && <UpgradeBanner />}

      <StatsGrid
        stats={dashboardData.stats}
        role={creditInfo.role}
        creditInfo={creditInfo}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAnalyses items={dashboardData.recentAnalyses} />
        </div>
        <div className="lg:col-span-1">
          <ScoreDistribution distribution={dashboardData.scoreDistribution} />
        </div>
      </div>
    </div>
  );
};

export default DashboardDataView;
