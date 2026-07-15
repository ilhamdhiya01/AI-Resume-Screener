import { queryOptions, useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/services/client/dashboard.service';

const baseKey = 'dashboard';

export const dashboardBaseOptions = queryOptions({
  queryKey: [baseKey],
  queryFn: () => getDashboard(),
  staleTime: 30_000,
  refetchOnWindowFocus: 'always',
});

export const useDashboard = () => {
  return useQuery({
    ...queryOptions({
      queryKey: [baseKey],
      queryFn: () => getDashboard(),
      staleTime: 30_000,
      refetchOnWindowFocus: 'always',
    }),
  });
};
