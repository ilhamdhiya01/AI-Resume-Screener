import React from 'react';
import { useShallow } from 'zustand/shallow';

import { useJobProgressStore } from '@/stores/analyzing/useJobProgressStore';

import { AnalysisResult } from './analysis-result';
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

    return (
      <aside className="flex w-full max-w-[35%] flex-col border-l border-slate-300 bg-[#f7fafc]">
        {progress === 100 && status === 'completed' ? (
          <AnalysisResult
            score={score}
            items={items}
            matchSummary={matchSummary}
          />
        ) : (
          <Step onRetry={onRetry} />
        )}
      </aside>
    );
  }
);

SideContent.displayName = 'SideContent';

export default SideContent;
