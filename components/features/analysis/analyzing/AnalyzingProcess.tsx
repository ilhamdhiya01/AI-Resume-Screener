'use client';

import dynamic from 'next/dynamic';

import { useJobProgress } from '@/lib/hooks/useJobProgress';

import SideContent from './side-content/SideContent';

// ✅ Disable SSR for Preview to avoid DOMMatrix error from pdf.js
const Preview = dynamic(() => import('./preview').then((mod) => mod.Preview), {
  ssr: false,
});

interface AnalyzingProcessProps {
  resumeId: string;
}

const AnalyzingProcess = ({ resumeId }: AnalyzingProcessProps) => {
  const { progress, step, status, fileName, duration, fileUrl } =
    useJobProgress(resumeId);

  console.log({ status, progress });

  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      <Preview progress={progress} fileName={fileName} fileUrl={fileUrl} />
      <SideContent
        progress={progress}
        step={step as string}
        status={status}
        duration={duration || 0}
      />
    </div>
  );
};

export default AnalyzingProcess;
