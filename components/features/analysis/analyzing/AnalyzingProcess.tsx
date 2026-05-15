'use client';

import { useJobProgress } from '@/lib/hooks/useJobProgress';

import { Preview } from './preview';
import SideContent from './side-content/SideContent';

interface AnalyzingProcessProps {
  resumeId: string;
}

const AnalyzingProcess = ({ resumeId }: AnalyzingProcessProps) => {
  const { progress, step, status, fileName } = useJobProgress(resumeId);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      <Preview progress={progress} fileName={fileName || ''} />
      <SideContent
        progress={progress}
        step={step as string}
        status={status as string}
      />
    </div>
  );
};

export default AnalyzingProcess;
