import { useMutation } from '@tanstack/react-query';

import { notify } from '@/lib/utils/toast';
import { retryJob } from '@/services/client/resume-analysis.service';

const useRetryJob = (callbacks: {
  onRetrySuccess: () => void; // caller: isFirstPoll.current = true; startPolling()
}) => {
  return useMutation({
    mutationFn: (jobId: string) => retryJob(jobId),
    onSuccess: () => {
      callbacks.onRetrySuccess();
    },
    onError: (error) => {
      notify({ type: 'error', title: error.message });
    },
  });
};

export default useRetryJob;
