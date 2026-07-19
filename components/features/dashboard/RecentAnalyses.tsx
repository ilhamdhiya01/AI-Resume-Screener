import classNames from 'classnames';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { RecentAnalysisItem } from '@/lib/types/dashboard.types';
import { HISTORY_PATH } from '@/routes';
import { useAnalysisStore } from '@/stores';

import { getFileIcon, getScoreBadge } from './analysis.utils';
import DashboardCard from './DashboardCard';

interface RecentAnalysesProps {
  items: RecentAnalysisItem[];
}

const EmptyState = () => {
  const openFileDialog = useAnalysisStore((state) => state.open);

  return (
    <DashboardCard className="p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 sm:size-16">
        <Icon icon="TbFileText" size={28} className="sm:size-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">
        No Resumes Analyzed Yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
        Your recent analysis results will appear here once you upload a resume.
      </p>
      <div className="mt-6">
        <Button
          label="Upload Your First Resume"
          preffixIcon="TbUpload"
          variant="contained"
          onClick={() => openFileDialog?.()}
        />
      </div>
    </DashboardCard>
  );
};

const RecentAnalyses = ({ items }: RecentAnalysesProps) => {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <DashboardCard>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
          Recent Analyses
        </h2>
        <Link
          href={HISTORY_PATH}
          className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item) => {
          const badge = getScoreBadge(item.score);
          const file = getFileIcon(item.fileType);

          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div
                  className={classNames(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10',
                    file.className
                  )}
                >
                  <Icon icon={file.icon} size={18} className="sm:size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.role ?? 'Unknown role'} •{' '}
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span
                  className={classNames(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    badge.className
                  )}
                >
                  {badge.label}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {item.score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default RecentAnalyses;
