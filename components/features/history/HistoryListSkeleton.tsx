'use client';

import React, { memo } from 'react';

import Icon from '@/components/ui/icon';

interface HistoryListSkeletonProps {
  rows?: number;
}

const DEFAULT_ROWS = 6;

const ShimmerBar = memo<{ className?: string }>(({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}
  >
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
));
ShimmerBar.displayName = 'ShimmerBar';

const SkeletonRow = memo(() => (
  <div
    role="status"
    aria-label="Loading resume row"
    className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    {/* File icon */}
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>

    {/* Title + meta */}
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <ShimmerBar className="h-3.5 w-1/2" />
      <div className="flex items-center gap-2">
        <ShimmerBar className="h-2.5 w-20" />
        <ShimmerBar className="size-1 !rounded-full" />
        <ShimmerBar className="h-2.5 w-12" />
      </div>
    </div>

    {/* Score */}
    <div className="w-20 shrink-0">
      <ShimmerBar className="mx-auto h-8 w-12" />
    </div>

    {/* Divider */}
    <div className="h-10 w-px shrink-0 bg-slate-200" />

    {/* Status pill */}
    <div className="w-32 shrink-0">
      <ShimmerBar className="mx-auto h-6 w-24 !rounded-full" />
    </div>

    {/* Divider */}
    <div className="h-10 w-px shrink-0 bg-slate-200" />

    {/* Action buttons */}
    <div className="flex shrink-0 items-center gap-2">
      <ShimmerBar className="h-9 w-24" />
      <ShimmerBar className="size-9" />
      <ShimmerBar className="size-9" />
    </div>
  </div>
));
SkeletonRow.displayName = 'SkeletonRow';

const HistoryListSkeleton = memo<HistoryListSkeletonProps>(
  ({ rows = DEFAULT_ROWS }) => {
    return (
      <div
        className="flex flex-col gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="relative inline-flex size-4 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/40" />
            <Icon
              icon="TbLoader2"
              size={16}
              className="relative animate-spin text-blue-600"
            />
          </span>
          <span className="font-medium">Loading resumes…</span>
        </div>

        <div className="relative max-h-[calc(100vh-350px)] space-y-4 overflow-hidden">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}

          {/* Fade-out at bottom to suggest more content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>
      </div>
    );
  }
);

HistoryListSkeleton.displayName = 'HistoryListSkeleton';

export default HistoryListSkeleton;
