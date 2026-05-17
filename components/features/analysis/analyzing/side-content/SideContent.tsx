import { AnalysisResult } from './analysis-result';

interface SideContentProps {
  progress: number;
  step: string;
  status: string;
  duration: number;
}

const SideContent = ({}: SideContentProps) => {
  return (
    <aside className="flex w-full max-w-[35%] flex-col border-l border-slate-300 bg-[#f7fafc]">
      {/* <header className="flex h-16 shrink-0 items-center border-b border-slate-300 bg-[#f7fafc] px-6">
        <h1 className="text-2xl font-bold">Analysis Results</h1>
      </header> */}

      <AnalysisResult />

      {/* <Step
        progress={progress}
        step={step as string}
        status={status}
        duration={duration}
      /> */}
    </aside>
  );
};

export default SideContent;
