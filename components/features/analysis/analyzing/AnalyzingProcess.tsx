'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/Modal/Modal';
import { useJobProgress } from '@/lib/hooks/analyzing/useJobProgress';
import { useAnalysisStore, useJobProgressStore } from '@/stores';

import SideContent from './side-content/SideContent';
import SkelatonPreview from './SkelatonPreview';

// Disable SSR for Preview to avoid DOMMatrix error from pdf.js
const Preview = dynamic(() => import('./preview').then((mod) => mod.Preview), {
  ssr: false,
});

interface AnalyzingProcessProps {
  resumeId: string;
}

const AnalyzingProcess = ({ resumeId }: AnalyzingProcessProps) => {
  const { retryJob, cancelJob, isCancelling } = useJobProgress(resumeId);

  const { progress, status, data, jobId } = useJobProgressStore(
    useShallow((state) => ({
      progress: state.progress,
      status: state.status,
      data: state.data,
      jobId: state.jobId,
    }))
  );

  // Pisahkan jenis kegagalan: cancel by user vs error teknis.
  const { setModalCancelProcess, modalCancelProcess } = useAnalysisStore(
    useShallow((state) => ({
      setModalCancelProcess: state.setModalCancelProcess,
      modalCancelProcess: state.modalCancelProcess,
    }))
  );

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

  const handleRetryJob = useCallback(async () => {
    if (jobId) {
      await retryJob(jobId);
    }
  }, [jobId, retryJob]);

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
            score={data?.score || 0}
            items={items}
            matchSummary={data?.matchSummary}
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
              isLoading={isCancelling}
              onClick={handleCancelJob}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AnalyzingProcess;
