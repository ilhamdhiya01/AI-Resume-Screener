import { useQuery } from '@tanstack/react-query';

import { verifyEmail } from '@/services/client/auth.service';

export const useVerifyEmailMutation = (token?: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => verifyEmail(token!),
    enabled: !!token,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};
