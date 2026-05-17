'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import axiosInstance from '../axios';

interface JobStatus {
  status: string;
  progress: number;
  jobId?: string;
  step?:
    | 'parsing'
    | 'extracting_skills'
    | 'mapping_timeline'
    | 'calculating_score'
    | 'completed'
    | 'failed'
    | 'unknown';
  fileName?: string;
  duration?: number;
  fileUrl?: string;
}

export const useJobProgress = (resumeId: string | null) => {
  const [jobStatus, setJobStatus] = useState<JobStatus>({
    status: 'idle',
    progress: 0,
  });
  const [displayProgress, setDisplayProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstPoll = useRef(true); // ✅ Track first poll

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

  useEffect(() => {
    if (!resumeId) return;

    const poll = async () => {
      // ✅ Skip if tab hidden
      if (document.hidden) return;

      try {
        const res = await axiosInstance.get(
          `/upload/status?resumeId=${resumeId}`
        );
        const data = res.data.data;

        if (data) {
          // ✅ First poll: set displayProgress immediately (no animation)
          if (isFirstPoll.current) {
            isFirstPoll.current = false;
            setDisplayProgress(data.progress);
          }

          setJobStatus({ ...data });

          // Stop polling when done
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Listen for visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        intervalRef.current = setInterval(poll, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll immediately, then every 3 seconds
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resumeId, stopPolling]);

  return { ...jobStatus };
};
