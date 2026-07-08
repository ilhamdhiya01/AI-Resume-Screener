import React from 'react';

import Skelaton from './preview/Skelaton';

const SkelatonPreview = React.memo(() => {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full animate-pulse overflow-hidden">
      <div className="relative flex w-full max-w-[65%] flex-col">
        {/* Header skeleton */}
        <header className="flex h-16 shrink-0 items-center border-b border-slate-300 bg-[#f7fafc]">
          <nav className="flex w-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded bg-gray-200" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-28 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="size-5 rounded bg-gray-200" />
              <div className="size-5 rounded bg-gray-200" />
              <div className="size-5 rounded bg-gray-200" />
            </div>
          </nav>
        </header>

        <div className="relative m-8 flex min-h-[calc(100%-2rem)] flex-col items-center justify-center gap-10 overflow-hidden rounded-xl bg-white drop-shadow-xl">
          <Skelaton />
        </div>
      </div>
      <aside className="flex w-full max-w-[35%] flex-col border-l border-slate-300 bg-[#f7fafc]">
        <div className="overflow-auto p-10">
          <div className="space-y-5">
            <div className="relative mx-auto flex size-56 items-center justify-center rounded-full bg-gray-200">
              <div className="size-50 rounded-full bg-[#f7fafc]" />
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-3 w-56 rounded bg-gray-200" />
              <div className="h-3 w-36 rounded bg-gray-200" />
            </div>

            <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/30 p-5">
              {/* Header: icon + title + badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="size-6 rounded-full bg-gray-200" />
              </div>

              {/* List items */}
              <div className="space-y-3 pl-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="size-1.5 shrink-0 rounded-full bg-gray-200" />
                    <div
                      className="h-3 rounded bg-gray-200"
                      style={{ width: `${85 - index * 15}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/30 p-5">
              {/* Header: icon + title + badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="size-6 rounded-full bg-gray-200" />
              </div>

              {/* List items */}
              <div className="space-y-3 pl-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="size-1.5 shrink-0 rounded-full bg-gray-200" />
                    <div
                      className="h-3 rounded bg-gray-200"
                      style={{ width: `${85 - index * 15}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/30 p-5">
              {/* Header: icon + title + badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="size-6 rounded-full bg-gray-200" />
              </div>

              {/* List items */}
              <div className="space-y-3 pl-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="size-1.5 shrink-0 rounded-full bg-gray-200" />
                    <div
                      className="h-3 rounded bg-gray-200"
                      style={{ width: `${85 - index * 15}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
});

SkelatonPreview.displayName = 'SkelatonPreview';

export default SkelatonPreview;
