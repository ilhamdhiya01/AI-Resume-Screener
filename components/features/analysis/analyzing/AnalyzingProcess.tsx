'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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
    completedSteps,
    data,
    jobId,
    isCancelled,
    failedReason,
    retryJob,
    cancelJob,
  } = useJobProgress(resumeId);

  // Pisahkan jenis kegagalan: cancel by user vs error teknis.
  const isTechnicalError = status === 'failed' && !isCancelled;
  const { setModalCancelProcess, modalCancelProcess } = useAnalysisStore();

  const [showResult, setShowResult] = useState<boolean>(false);
  const hasTriggeredSkeleton = useRef<boolean>(false);

  // Stabilize object reference untuk prevent unnecessary re-render di SideContent
  const items = useMemo(
    () => ({
      criticals: data?.criticals || [],
      suggestions: data?.suggestions || [],
      strengths: data?.strengths || [],
    }),
    [data?.criticals, data?.suggestions, data?.strengths]
  );

  // Stabilize criticalHighlights array untuk prevent Preview re-render
  const criticalHighlights = useMemo(
    () => data?.criticalHighlights || [],
    [data?.criticalHighlights]
  );

  // Stabilize durations object untuk prevent SideContent re-render
  const stableDurations = useMemo(() => durations || {}, [durations]);

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

  // Skeleton only when completed + waiting for transition.
  // Saat error teknis, JANGAN tampilkan skeleton biar step tracker yang
  // nandain step gagal (icon X) tetap kelihatan.
  const showSkeleton =
    progress === 100 && status === 'completed' && !showResult;

  return (
    <>
      {showSkeleton ? (
        <SkelatonPreview />
      ) : (
        <div className="flex h-[calc(100vh-64px)] w-full">
          <Preview
            progress={progress}
            fileName={data?.resume.fileName}
            fileUrl={data?.resume.filePath}
            criticalHighlights={criticalHighlights}
          />
          <SideContent
            progress={progress}
            step={step as string}
            status={status}
            durations={stableDurations}
            completedSteps={completedSteps}
            score={data?.score || 0}
            items={items}
            matchSummary={data?.matchSummary}
            isCancelled={isCancelled}
            failedReason={failedReason}
            onRetry={handleRetryJob}
          />
        </div>
      )}
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
      {/* <Modal isOpen={!!isCancelled}>
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
            <Icon icon="TbCircleX" size={30} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold">Process Cancelled</h1>
          <p>Proses analisis telah dibatalkan oleh pengguna.</p>
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
      </Modal> */}
    </>
  );
};

export default AnalyzingProcess;
