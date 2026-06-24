import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getResumeHistory } from '@/services/client/resume-history.service';

export const useHistory = (
  page: number = 1,
  status?: string,
  search?: string
) => {
  return useQuery({
    ...queryOptions({
      queryKey: ['resume-history', page, status, search],
      queryFn: () => getResumeHistory(page, status, search),
      placeholderData: keepPreviousData,
      staleTime: 30_000,
      refetchOnWindowFocus: 'always',
    }),
  });
};
