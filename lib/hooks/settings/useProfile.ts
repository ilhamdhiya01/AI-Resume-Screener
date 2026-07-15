import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UserProfile, UserProfileInput } from '@/lib/types/settings.types';
import { getProfile, updateProfile } from '@/services/client/profile.service';

const PROFILE_QUERY_KEY = ['user', 'profile'];

export const profileQueryOptions = () => ({
  queryKey: PROFILE_QUERY_KEY,
  queryFn: getProfile,
  staleTime: 5 * 60 * 1000,
});

/**
 * @description TanStack Query hook for fetching and updating the user profile.
 * @returns {object} Query and mutation state for profile management.
 */
export const useProfile = () => {
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile>(profileQueryOptions());

  const mutation = useMutation<UserProfile, Error, UserProfileInput>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};
