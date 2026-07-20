'use client';

import classNames from 'classnames';
import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import Icon from '@/components/ui/icon';
import { useJobProgressStore } from '@/stores/analyzing/useJobProgressStore';

import { AnalysisResultV2 } from './analysis-result-v2';
import { Step } from './step';

interface SideContentProps {
  score: number;
  items: {
    criticals: string[];
    strengths: string[];
    suggestions: string[];
  };
  matchSummary?: string;
  onRetry?: () => void;
}

const SideContent = React.memo<SideContentProps>(
  ({ score, items, matchSummary, onRetry }) => {
    const { progress, status } = useJobProgressStore(
      useShallow((state) => ({
        progress: state.progress,
        status: state.status,
      }))
    );

    const [isSheetOpen, setIsSheetOpen] = useState(true);

    const content =
      progress === 100 && status === 'completed' ? (
        <AnalysisResultV2
          score={score}
          items={items}
          matchSummary={matchSummary}
        />
      ) : (
        <Step onRetry={onRetry} />
      );

    return (
      <>
        {/* Desktop: static side panel */}
        <aside className="hidden lg:flex lg:h-auto lg:max-w-[42%] lg:flex-1 lg:flex-col lg:border-l lg:border-slate-200 lg:bg-white">
          {content}
        </aside>

        {/* Mobile: floating trigger button when sheet is closed */}
        {!isSheetOpen && (
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="bg-primary-600 fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg lg:hidden"
          >
            <span className="inline-flex items-center gap-2">
              <Icon icon="TbChevronUp" size={18} />
              View Progress
            </span>
          </button>
        )}

        {/* Mobile: backdrop when sheet is open */}
        {isSheetOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile: bottom sheet */}
        <aside
          className={classNames(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-screen flex-col rounded-t-2xl border-t border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:hidden',
            isSheetOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Sheet header with close button */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">
              Workflow Progress
            </span>
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close progress panel"
            >
              <Icon icon="TbX" size={20} />
            </button>
          </div>

          {/* Sheet content */}
          <div className="flex-1 overflow-y-auto">{content}</div>
        </aside>
      </>
    );
  }
);

SideContent.displayName = 'SideContent';

export default SideContent;
