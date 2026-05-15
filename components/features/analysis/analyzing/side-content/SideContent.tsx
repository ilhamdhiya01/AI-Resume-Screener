import { Step } from './step';

interface SideContentProps {
  progress: number;
  step: string;
  status: string;
}

const SideContent = ({ progress, step, status }: SideContentProps) => {
  return (
    <aside className="flex w-full max-w-[418px] flex-col border-l border-slate-300 bg-white">
      <Step progress={progress} step={step as string} status={status} />
    </aside>
  );
};

export default SideContent;
