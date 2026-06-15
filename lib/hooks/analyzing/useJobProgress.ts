/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getJobStatus } from '@/services/client/resume-analysis.service';

import { ResumeJobStatus } from '../../types/resume-analysis.types';
import { useCancelJob } from './useCancelJob';
import { useRetryJob } from './useRetryJob';

export const useJobProgress = (resumeId: string | null) => {
  const [jobStatus, setJobStatus] = useState<ResumeJobStatus>({
    status: 'idle',
    progress: 0,
  });
  const [displayProgress, setDisplayProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstPoll = useRef(true);

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

        setJobStatus({ ...data });

        // Stop polling when condition
        if (
          data.status === 'completed' ||
          data.status === 'failed' ||
          jobStatus.status === 'failed'
        ) {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [resumeId, stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling(); // Clear old interval if exists
    poll(); // Run once immediately without waiting 3 seconds
    intervalRef.current = setInterval(poll, 1000);
    console.log('Polling started/resumed');
  }, [poll, stopPolling]);

  useEffect(() => {
    const target = jobStatus.progress;
    if (displayProgress < target) {
      animationRef.current = setTimeout(() => {
        setDisplayProgress((prev) => prev + 1);
      }, 100);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [displayProgress, jobStatus.progress]);

  // Handle main polling lifecycle & visibility change
  useEffect(() => {
    if (!resumeId) return;

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Resume polling when tab becomes visible and status is not done/failed
        if (jobStatus.status !== 'completed' && jobStatus.status !== 'failed') {
          startPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resumeId, startPolling, stopPolling, jobStatus.status]);

  const { mutateAsync: retryJob, isPending: isRetrying } = useRetryJob({
    onRetrySuccess: () => {
      isFirstPoll.current = true;
      startPolling();
    },
  });

  const { mutateAsync: cancelJob, isPending: isCancelling } = useCancelJob({
    onCancelSuccess: () => {
      setJobStatus((prev) => ({
        ...prev,
        status: 'failed',
        isCancelled: true,
      }));
      startPolling();
    },
  });

  return { ...jobStatus, retryJob, cancelJob, isRetrying, isCancelling };
};
