import classNames from 'classnames';
import React from 'react';

const SkeletonBar = ({ className }: { className: string }) => (
  <div className={classNames('animate-pulse rounded bg-gray-200', className)} />
);

const SkeletonStatsCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <SkeletonBar className="h-4 w-28 sm:w-32" />
        <SkeletonBar className="h-7 w-16 sm:h-8 sm:w-20" />
      </div>
      <SkeletonBar className="size-9 rounded-lg sm:size-10" />
    </div>
    <SkeletonBar className="mt-4 h-5 w-24 rounded-full" />
  </div>
);

const SkeletonRecentItem = () => (
  <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <div className="flex items-center gap-3 sm:gap-4">
      <SkeletonBar className="size-9 rounded-lg sm:size-10" />
      <div className="space-y-2">
        <SkeletonBar className="h-4 w-40 sm:w-48" />
        <SkeletonBar className="h-3 w-28 sm:w-32" />
      </div>
    </div>
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      <SkeletonBar className="h-5 w-24 rounded-full" />
      <SkeletonBar className="h-5 w-10" />
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <section className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonStatsCard key={index} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2 lg:p-6">
        <SkeletonBar className="mb-4 h-6 w-40 sm:mb-6" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonRecentItem key={index} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-1 lg:p-6">
        <SkeletonBar className="mb-4 h-6 w-40 sm:mb-6" />
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <SkeletonBar className="size-36 rounded-full sm:size-40 lg:size-44" />
          <div className="w-full space-y-2 sm:space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBar className="size-3 rounded-full" />
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="ml-auto h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardSkeleton;
