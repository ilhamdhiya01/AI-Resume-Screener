/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ANALYSIS_PATH } from '@/routes';

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
    | 'parsing'
    | 'extracting_skills'
    | 'mapping_timeline'
    | 'calculating_score'
    | 'completed'
    | 'failed'
    | 'unknown';
  durations?: Record<string, number>;
  data?: ResumeData;
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

  const router = useRouter();

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
    stopPolling(); // Bersihkan interval lama jika ada
    poll(); // Jalankan sekali langsung tanpa nunggu 3 detik
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

  // Handle siklus polling utama & visibility change
  useEffect(() => {
    if (!resumeId) return;

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Nyalakan kembali kalau tab dibuka lagi dan status belum kelar/gagal
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

  // useEffect(() => {
  //   if (!resumeId) return;

  //   // Listen for visibility change
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       stopPolling();
  //     } else {
  //       intervalRef.current = setInterval(poll, 3000);
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   // Poll immediately, then every 3 seconds
  //   poll();
  //   intervalRef.current = setInterval(poll, 3000);
  //   return () => {
  //     stopPolling();
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [resumeId, stopPolling]);

  const retryJob = async (jobId: string): Promise<string | null> => {
    try {
      // Catatan: Pastikan endpoint ini di backend bertugas me-retry job ke BullMQ, ya!
      const response = await axiosInstance.get(
        `/upload/status/${jobId}?retry=true`
      );

      // 🎯 KUNCI UTAMA: Hidupkan kembali polling setelah hit API retry sukses
      startPolling();

      return response.data;
    } catch (err) {
      console.error('Failed to retry job:', err);
      return null;
    }
  };

  const cancelJob = async (jobId: string): Promise<string | null> => {
    try {
      const response = await axiosInstance.get(
        `/upload/status/${jobId}?cancel=true`
      );
      // 🎯 KUNCI UTAMA: Hidupkan kembali polling setelah hit API cancel sukses
      // startPolling();

      const data = response.data;

      console.log({ data });

      if (data?.success) {
        startPolling();
        // router.push(ANALYSIS_PATH);
      }

      return data;
    } catch (error) {
      console.error('Failed to cancel job:', error);
      return null;
    }
  };

  return { ...jobStatus, retryJob, cancelJob };
};
