'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { useJobProgress } from '@/lib/hooks/useJobProgress';

import SideContent from './side-content/SideContent';
import SkelatonPreview from './SkelatonPreview';

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

  const [showResult, setShowResult] = useState<boolean>(false);
  const hasTriggeredSkeleton = useRef<boolean>(false);

  useEffect(() => {
    if (
      progress === 100 &&
      status === 'completed' &&
      !hasTriggeredSkeleton.current
    ) {
      hasTriggeredSkeleton.current = true;
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, status]);

  // Skeleton only when completed + waiting for transition
  const showSkeleton =
    progress === 100 && status === 'completed' && !showResult;

  return showSkeleton ? (
    <SkelatonPreview />
  ) : (
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
