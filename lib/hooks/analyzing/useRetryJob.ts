import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { retryJob } from '@/services/client/resume-analysis.service';

export const useRetryJob = (callbacks: {
  onRetrySuccess: () => void; // caller: isFirstPoll.current = true; startPolling()
}) => {
  return useMutation({
    mutationFn: (jobId: string) => retryJob(jobId),
    onSuccess: () => {
      callbacks.onRetrySuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
