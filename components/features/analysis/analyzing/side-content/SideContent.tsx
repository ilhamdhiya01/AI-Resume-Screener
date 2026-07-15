import React from 'react';
import { useShallow } from 'zustand/shallow';

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

    return (
      <aside className="flex w-full max-w-[42%] flex-col border-l border-slate-200 bg-white">
        {progress === 100 && status === 'completed' ? (
          <AnalysisResultV2
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
