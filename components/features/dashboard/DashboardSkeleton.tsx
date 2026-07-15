import classNames from 'classnames';
import React from 'react';

const SkeletonBar = ({ className }: { className: string }) => (
  <div className={classNames('animate-pulse rounded bg-gray-200', className)} />
);

const DashboardSkeleton = () => (
  <section className="flex flex-col gap-6">
    {/* <div className="space-y-2">
      <SkeletonBar className="h-9 w-64" />
      <SkeletonBar className="h-5 w-96" />
    </div> */}

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-8 w-20" />
            </div>
            <SkeletonBar className="size-10 rounded-lg" />
          </div>
          <SkeletonBar className="mt-4 h-5 w-24 rounded-full" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <SkeletonBar className="mb-6 h-6 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <SkeletonBar className="size-10 rounded-lg" />
                <div className="space-y-2">
                  <SkeletonBar className="h-4 w-48" />
                  <SkeletonBar className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBar className="h-5 w-24 rounded-full" />
                <SkeletonBar className="h-5 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
        <SkeletonBar className="mb-6 h-6 w-40" />
        <div className="flex flex-col items-center gap-6">
          <SkeletonBar className="size-40 rounded-full" />
          <div className="w-full space-y-3">
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
