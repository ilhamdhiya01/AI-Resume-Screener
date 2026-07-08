'use client';

import { useEffect, useRef, useState } from 'react';

import { UploadStatus } from '@/app/generated/prisma/enums';
import { queryClient } from '@/lib/tanstack-query';
import { getJobStatus } from '@/services/client/resume-analysis.service';

/**
 * @description Hook to poll job progress for a single resume item in history.
 * Only starts polling if status is PENDING or PROCESSING.
 * Stops polling automatically when status becomes COMPLETED or FAILED.
 * @param {string} id - Resume ID.
 * @param {UploadStatus} status - Current upload status from history.
 * @returns {{ progress: number }} Current job progress (0-100).
 */
const useItemJobProgress = (id: string, status: UploadStatus) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = status === 'PENDING' || status === 'PROCESSING';

  useEffect(() => {
    if (!isActive) return;

    const poll = async () => {
      try {
        const res = await getJobStatus(id);
        const data = res.data;

        if (data) {
          setProgress(data.progress ?? 0);

          if (data.status === 'completed' || data.status === 'failed') {
            if (intervalRef.current) {
              queryClient.invalidateQueries({ queryKey: ['resume-history'] });
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      } catch {
        // Silently ignore polling errors; status will remain stale
      }
    };

    // Run immediately then every second
    poll();
    intervalRef.current = setInterval(poll, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, isActive]);

  return { progress };
};

export default useItemJobProgress;
