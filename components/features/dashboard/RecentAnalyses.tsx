import classNames from 'classnames';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import React from 'react';

import Button from '@/components/ui/button';
import Icon, { type IconName } from '@/components/ui/icon';
import { RecentAnalysisItem } from '@/lib/types/dashboard.types';
import { HISTORY_PATH } from '@/routes';
import { useAnalysisStore } from '@/stores';

interface RecentAnalysesProps {
  items: RecentAnalysisItem[];
}

type FileIcon = {
  icon: IconName;
  className: string;
};

const getScoreBadge = (score: number) => {
  if (score >= 70) {
    return {
      label: 'Strong Match',
      className: 'bg-green-100 text-green-700',
    };
  }

  if (score >= 40) {
    return {
      label: 'Average',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: 'Poor Fit',
    className: 'bg-red-100 text-red-600',
  };
};

const getFileIcon = (fileType: string): FileIcon => {
  const lower = fileType.toLowerCase();

  if (lower.includes('pdf')) {
    return { icon: 'TbFileTypePdf', className: 'bg-red-50 text-red-500' };
  }

  if (lower.includes('doc') || lower.includes('word')) {
    return { icon: 'TbFileTypeDoc', className: 'bg-blue-50 text-blue-500' };
  }

  return { icon: 'TbFile', className: 'bg-slate-100 text-slate-500' };
};

const RecentAnalyses = ({ items }: RecentAnalysesProps) => {
  const openFileDialog = useAnalysisStore((state) => state.open);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon icon="TbFileText" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          No Resumes Analyzed Yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          Your recent analysis results will appear here once you upload a
          resume.
        </p>
        <div className="mt-6">
          <Button
            label="Upload Your First Resume"
            preffixIcon="TbUpload"
            variant="contained"
            onClick={() => openFileDialog?.()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Recent Analyses
        </h2>
        <Link
          href={HISTORY_PATH}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const badge = getScoreBadge(item.score);
          const file = getFileIcon(item.fileType);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={classNames(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                    file.className
                  )}
                >
                  <Icon icon={file.icon} size={20} />
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

              <div className="flex shrink-0 items-center gap-3">
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
    </div>
  );
};

export default RecentAnalyses;
