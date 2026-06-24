import { queryOptions, useQuery } from '@tanstack/react-query';

import { verifyEmail } from '@/services/client/auth.service';

const useVerifyEmailMutation = (token?: string) => {
  const { data, isLoading, isError, error } = useQuery({
    ...queryOptions({
      queryKey: ['verify-email', token],
      queryFn: () => verifyEmail(token!),
      enabled: !!token,
    }),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useVerifyEmailMutation;
