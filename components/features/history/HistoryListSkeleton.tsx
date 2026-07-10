'use client';

import React, { memo } from 'react';

import Icon from '@/components/ui/icon';

interface HistoryListSkeletonProps {
  rows?: number;
}

interface SkeletonBarProps {
  className?: string;
}

const DEFAULT_ROWS = 5;

const SkeletonBar = memo<SkeletonBarProps>(({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
));
SkeletonBar.displayName = 'SkeletonBar';

const SkeletonRow = memo(() => (
  <div className="relative flex items-center gap-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-1 items-center gap-4">
      <div className="size-11 shrink-0 animate-pulse rounded-lg bg-gray-200" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <SkeletonBar className="h-4 w-1/2" />
        <SkeletonBar className="h-3 w-32" />
      </div>
    </div>

    <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1">
      <div className="size-12 animate-pulse rounded-full bg-gray-200" />
      <SkeletonBar className="h-2.5 w-10" />
    </div>

    <div className="h-10 w-px shrink-0 bg-slate-200" />

    <div className="flex w-32 shrink-0 items-center justify-center">
      <SkeletonBar className="h-7 w-24 rounded-full" />
    </div>

    <div className="h-10 w-px shrink-0 bg-slate-200" />

    <div className="flex shrink-0 items-center gap-2">
      <SkeletonBar className="h-10 w-28" />
      <SkeletonBar className="size-10" />
      <SkeletonBar className="size-10" />
    </div>
  </div>
));
SkeletonRow.displayName = 'SkeletonRow';

const HistoryListSkeleton = memo<HistoryListSkeletonProps>(
  ({ rows = DEFAULT_ROWS }) => (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon
          icon="TbLoader2"
          size={16}
          className="animate-spin text-blue-600"
        />
        <span className="font-medium">Loading resumes…</span>
      </div>

      <div className="relative max-h-[calc(100vh-350px)] space-y-4 overflow-y-auto">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    </div>
  )
);

HistoryListSkeleton.displayName = 'HistoryListSkeleton';

export default HistoryListSkeleton;
