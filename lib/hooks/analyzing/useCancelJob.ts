import { useMutation } from '@tanstack/react-query';

import { notify } from '@/lib/utils/toast';
import { cancelJob } from '@/services/client/resume-analysis.service';

const useCancelJob = (callbacks: {
  onCancelSuccess: () => void; // caller: isFirstPoll.current = true; startPolling()
}) => {
  return useMutation({
    mutationFn: (jobId: string) => cancelJob(jobId),
    onSuccess: () => {
      callbacks.onCancelSuccess();
    },
    onError: (error) => {
      notify({ type: 'error', title: error.message });
    },
  });
};

export default useCancelJob;
