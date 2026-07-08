import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notify } from '@/lib/utils/toast';
import { deleteResume } from '@/services/client/resume-history.service';

import { resumeHistoryBaseOptions } from './useHistory';

/**
 * @description Hook to delete a resume with loading state and cache invalidation.
 * @returns {{ handleDelete: (id: string) => void, isDeleting: boolean }}
 */
export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      notify({
        type: 'success',
        title: 'Delete Complete',
        description: 'The resume has been deleted successfully.',
      });
      queryClient.invalidateQueries({
        queryKey: resumeHistoryBaseOptions.queryKey,
      });
    },
    onError: (error: Error) => {
      notify({
        type: 'error',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete resume',
      });
    },
  });

  return {
    handleDelete: (id: string) =>
      notify({
        type: 'confirm',
        title: 'Delete Resume',
        description: 'This action cannot be undone. Are you sure?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        onConfirm: () => mutation.mutate(id),
      }),
    isDeleting: mutation.isPending,
  };
};

export default useDeleteResume;
