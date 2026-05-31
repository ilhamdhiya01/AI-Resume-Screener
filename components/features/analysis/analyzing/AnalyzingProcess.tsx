'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/Modal/Modal';
import { useJobProgress } from '@/lib/hooks/useJobProgress';
import { useAnalysisStore } from '@/lib/stores/global/useAnalysisStore';
import { ANALYSIS_PATH } from '@/routes';

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
  const {
    progress,
    step,
    status,
    durations,
    data,
    jobId,
    retryJob,
    cancelJob,
  } = useJobProgress(resumeId);
  const { setModalCancelProcess, modalCancelProcess } = useAnalysisStore();

  const [showResult, setShowResult] = useState<boolean>(false);
  const hasTriggeredSkeleton = useRef<boolean>(false);

  const router = useRouter();

  console.log({ progress, step, status });

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

  const handleRetryJob = async () => {
    if (jobId) {
      await retryJob(jobId);
    }
  };

  const handleCancelJob = async () => {
    if (jobId) {
      await cancelJob(jobId);
      setModalCancelProcess(false);
    }
  };

  // Skeleton only when completed + waiting for transition
  const showSkeleton =
    progress === 100 && status === 'completed' && !showResult;

  return (
    <>
      {showSkeleton || status === 'failed' ? (
        <SkelatonPreview />
      ) : (
        <div className="flex h-[calc(100vh-64px)] w-full">
          <Preview
            progress={progress}
            fileName={data?.resume.fileName}
            fileUrl={data?.resume.filePath}
            criticalHighlights={data?.criticalHighlights || []}
          />
          <SideContent
            progress={progress}
            step={step as string}
            status={status}
            durations={durations || {}}
            score={data?.score || 0}
            items={{
              criticals: data?.criticals || [],
              suggestions: data?.suggestions || [],
              strengths: data?.strengths || [],
            }}
            matchSummary={data?.matchSummary}
          />
        </div>
      )}
      <Modal isOpen={status === 'failed'}>
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-200">
            <Icon icon="TbAlertCircle" size={30} className="text-red-700" />
          </div>
          <h1 className="text-xl font-bold">Analysis Failed</h1>
          <p>
            A system error occurred while processing the document. The AI engine
            was unable to extract and classify the data in your resume.
          </p>
          <div className="flex gap-4">
            <Button
              preffixIcon="TbRefresh"
              label="Retry Analysis"
              className="mt-3"
              onClick={handleRetryJob}
            />
            <Button
              variant="outlined"
              preffixIcon="TbUpload"
              label="Upload New Resume"
              className="mt-3"
              onClick={() => {
                router.replace(ANALYSIS_PATH);
              }}
            />
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={modalCancelProcess}
        onClose={() => setModalCancelProcess(false)}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-200">
            <Icon icon="TbAlertCircle" size={30} className="text-red-700" />
          </div>
          <h1 className="text-xl font-bold">Cancel Process</h1>
          <p>Are you sure you want to cancel the analysis process?</p>
          <div className="flex gap-2">
            <Button
              preffixIcon="TbRefresh"
              label="Continue Process"
              className="mt-3"
              onClick={() => setModalCancelProcess(false)}
            />
            <Button
              variant="outlined"
              preffixIcon="TbCancel"
              label="Cancel Process"
              className="mt-3"
              onClick={handleCancelJob}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AnalyzingProcess;
