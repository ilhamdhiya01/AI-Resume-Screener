/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import axiosInstance from '../axios';
import { ResumeData } from '../types/resume-analysis.types';

interface JobStatus {
  status:
    | 'idle'
    | 'active'
    | 'waiting'
    | 'delayed'
    | 'paused'
    | 'completed'
    | 'failed';
  progress: number;
  jobId?: string;
  step?:
    | 'extracting_text_metadata'
    | 'analyzing_competencies'
    | 'mapping_timeline'
    | 'calculating_score'
    | 'completed'
    | 'failed'
    | 'unknown';
  durations?: Record<string, number>;
  completedSteps?: string[];
  data?: ResumeData;
  failedReason?: string | null;
  isCancelled?: boolean;
}

export const useJobProgress = (resumeId: string | null) => {
  const [jobStatus, setJobStatus] = useState<JobStatus>({
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

  useEffect(() => {
    const target = jobStatus.progress as number;

    if (displayProgress < target) {
      animationRef.current = setTimeout(() => {
        setDisplayProgress((prev) => prev + 1);
      }, 100); // 100ms per 1%
    }

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [displayProgress, jobStatus.progress]);

  const poll = useCallback(async () => {
    //  Skip if tab hidden
    if (document.hidden) return;

    try {
      const res = await axiosInstance.get(
        `/upload/status?resumeId=${resumeId}`
      );
      const data = res.data.data;

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
    console.log('🚀 Polling started/resumed');
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

  const retryJob = useCallback(
    async (jobId: string): Promise<string | null> => {
      try {
        // Note: Make sure the backend endpoint handles retrying the job to BullMQ
        const response = await axiosInstance.get(
          `/upload/status/${jobId}?retry=true`
        );

        // 🎯 Reset first-poll flag: first poll after retry sets displayProgress DIRECTLY to the failed step position,
        // instead of crawling from 0% again.
        isFirstPoll.current = true;

        // 🎯 KEY: Resume polling after successful retry API call
        startPolling();

        return response.data;
      } catch (err) {
        console.error('Failed to retry job:', err);
        return null;
      }
    },
    [startPolling]
  );

  const cancelJob = useCallback(
    async (jobId: string): Promise<string | null> => {
      try {
        const response = await axiosInstance.get(
          `/upload/status/${jobId}?cancel=true`
        );
        // 🎯 KEY: Resume polling after successful cancel API call
        // startPolling();

        const data = response.data;

        console.log({ data });

        if (data?.success) {
          // Optimistic update: mark as cancelled immediately so UI doesn't show
          // technical error modal before next poll reads it.
          setJobStatus((prev) => ({
            ...prev,
            status: 'failed',
            isCancelled: true,
          }));
          startPolling();
        }

        return data;
      } catch (error) {
        console.error('Failed to cancel job:', error);
        return null;
      }
    },
    [startPolling]
  );

  return { ...jobStatus, retryJob, cancelJob };
};
