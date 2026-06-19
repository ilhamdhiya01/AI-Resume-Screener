import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getResumeHistory } from '@/services/client/resume-history.service';

export const useHistory = (page: number = 1, status?: string) => {
  return useQuery({
    ...queryOptions({
      queryKey: ['resume-history', page, status],
      queryFn: () => getResumeHistory(page, status),
      placeholderData: keepPreviousData,
    }),
  });
};
