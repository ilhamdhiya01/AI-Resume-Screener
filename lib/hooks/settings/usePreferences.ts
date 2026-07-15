import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UserPreferences } from '@/lib/types/settings.types';
import {
  getPreferences,
  updatePreferences,
} from '@/services/client/preferences.service';

const PREFERENCES_QUERY_KEY = ['user', 'preferences'];

export const preferencesQueryOptions = () => ({
  queryKey: PREFERENCES_QUERY_KEY,
  queryFn: getPreferences,
  staleTime: 5 * 60 * 1000,
});

/**
 * @description TanStack Query hook for fetching and updating AI preferences.
 * @returns {object} Query and mutation state for preferences management.
 */
export const usePreferences = () => {
  const queryClient = useQueryClient();

  const query = useQuery<UserPreferences>(preferencesQueryOptions());

  const mutation = useMutation<UserPreferences, Error, UserPreferences>({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updatePreferences: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};
