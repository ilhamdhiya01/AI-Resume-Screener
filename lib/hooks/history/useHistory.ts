import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { getResumeHistory } from '@/services/client/resume-history.service';

const baseKey = 'resume-history';

export const resumeHistoryBaseOptions = queryOptions({
  queryKey: [baseKey],
  queryFn: () => getResumeHistory(1),
  staleTime: 30_000,
  refetchOnWindowFocus: 'always',
});

export const useHistory = (
  page: number = 1,
  status?: string,
  search?: string,
  dateFrom?: string,
  dateTo?: string
) => {
  return useQuery({
    ...queryOptions({
      queryKey: [baseKey, page, status, search, dateFrom, dateTo],
      queryFn: () => getResumeHistory(page, status, search, dateFrom, dateTo),
      placeholderData: keepPreviousData,
      staleTime: 30_000,
      refetchOnWindowFocus: 'always',
    }),
  });
};
