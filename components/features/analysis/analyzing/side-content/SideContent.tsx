import React from 'react';

import { AnalysisResult } from './analysis-result';
import { Step } from './step';

interface SideContentProps {
  progress: number;
  step: string;
  status: string;
  durations: Record<string, number>;
  completedSteps?: string[];
  score: number;
  items: {
    criticals: string[];
    strengths: string[];
    suggestions: string[];
  };
  matchSummary?: string;
  isCancelled?: boolean;
  failedReason?: string | null;
  onRetry?: () => void;
}

const SideContent = React.memo<SideContentProps>(
  ({
    progress,
    step,
    status,
    durations,
    completedSteps,
    score,
    items,
    matchSummary,
    isCancelled,
    failedReason,
    onRetry,
  }) => {
    return (
      <aside className="flex w-full max-w-[35%] flex-col border-l border-slate-300 bg-[#f7fafc]">
        {progress === 100 && status === 'completed' ? (
          <AnalysisResult
            score={score}
            items={items}
            matchSummary={matchSummary}
          />
        ) : (
          <Step
            progress={progress}
            step={step as string}
            status={status}
            durations={durations}
            completedSteps={completedSteps}
            isCancelled={isCancelled}
            failedReason={failedReason}
            onRetry={onRetry}
          />
        )}
      </aside>
    );
  }
);

SideContent.displayName = 'SideContent';

export default SideContent;
