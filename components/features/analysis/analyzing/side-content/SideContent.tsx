import { AnalysisResult } from './analysis-result';
import { Step } from './step';

interface SideContentProps {
  progress: number;
  step: string;
  status: string;
  duration: number;
  score: number;
  items: {
    criticals: string[];
    strengths: string[];
    suggestions: string[];
  };
  matchSummary?: string;
}

const SideContent = ({
  progress,
  step,
  status,
  duration,
  score,
  items,
  matchSummary,
}: SideContentProps) => {
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
          duration={duration}
        />
      )}
    </aside>
  );
};

export default SideContent;
