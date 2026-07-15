import { queryOptions, useQuery } from '@tanstack/react-query';

import { getCreditStatus } from '@/services/client/credit.service';

const ANALYSIS_LIMIT_QUERY_KEY = 'analysis-limit';

const analysisLimitOptions = queryOptions({
  queryKey: [ANALYSIS_LIMIT_QUERY_KEY],
  queryFn: () => getCreditStatus(),
  staleTime: 30_000,
  refetchOnWindowFocus: 'always',
});

/**
 * @description Hook to fetch the current user's analysis credit status.
 * @returns {Object} Credit status, loading state, and refetch function.
 */
export const useAnalysisLimit = () => {
  const { data, isPending, isError, refetch } = useQuery(analysisLimitOptions);

  const credit = data?.data;

  return {
    credit,
    isPending,
    isError,
    refetch,
    canAnalyze: credit?.canAnalyze ?? true,
    isLimited: credit?.limit !== null,
    remaining:
      credit && credit.limit !== null
        ? Math.max(0, credit.limit - credit.used)
        : null,
  };
};
