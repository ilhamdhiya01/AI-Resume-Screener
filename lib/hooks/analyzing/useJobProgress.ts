'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { getJobStatus } from '@/services/client/resume-analysis.service';
import { useJobProgressStore } from '@/stores/analyzing/useJobProgressStore';

import { useCancelJob } from './useCancelJob';
import { useRetryJob } from './useRetryJob';

export const useJobProgress = (resumeId: string | null) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstPoll = useRef(true);

  const {
    status,
    progress,
    displayProgress,
    setDisplayProgress,
    setJobStatus,
  } = useJobProgressStore(
    useShallow((state) => ({
      status: state.status,
      progress: state.progress,
      displayProgress: state.displayProgress,
      setDisplayProgress: state.setDisplayProgress,
      setJobStatus: state.setJobStatus,
    }))
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    //  Skip if tab hidden
    if (document.hidden) return;

    try {
      const res = await getJobStatus(resumeId!);
      const data = res.data;

      if (data) {
        // First poll: set displayProgress immediately (no animation)
        if (isFirstPoll.current) {
          isFirstPoll.current = false;
          setDisplayProgress(data.progress);
        }

        setJobStatus(data);

        // Stop polling when condition
        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [resumeId, stopPolling, setJobStatus, setDisplayProgress]);

  const startPolling = useCallback(() => {
    stopPolling(); // Clear old interval if exists
    poll(); // Run once immediately without waiting 3 seconds
    intervalRef.current = setInterval(poll, 1000);
    console.log('Polling started/resumed');
  }, [poll, stopPolling]);

  useEffect(() => {
    const target = progress;
    if (displayProgress < target) {
      animationRef.current = setTimeout(() => {
        setDisplayProgress((prev) => prev + 1);
      }, 100);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [displayProgress, progress, setDisplayProgress]);

  // Handle main polling lifecycle & visibility change
  useEffect(() => {
    if (!resumeId) return;

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Resume polling when tab becomes visible and status is not done/failed
        if (status !== 'completed' && status !== 'failed') {
          startPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resumeId, startPolling, stopPolling, status]);

  const { mutateAsync: retryJob, isPending: isRetrying } = useRetryJob({
    onRetrySuccess: () => {
      isFirstPoll.current = true;
      startPolling();
    },
  });

  const { mutateAsync: cancelJob, isPending: isCancelling } = useCancelJob({
    onCancelSuccess: () => {
      setJobStatus({ status: 'failed', isCancelled: true });
      startPolling();
    },
  });

  return { retryJob, cancelJob, isRetrying, isCancelling };
};
