import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

import { getAuthErrorMessage } from '@/lib/errors/auth.error';
import { LoginRequest } from '@/lib/types/auth.types';

export const useLoginMutation = () => {
  const loginmMutation = useMutation({
    mutationFn: (payload: LoginRequest) =>
      signIn('credentials', {
        ...payload,
        redirect: false,
      }),
    onSuccess: (response) => {
      if (response?.error) {
        const errorMessage = getAuthErrorMessage(
          (response.code as string) ?? response.error
        );
        return toast.error(errorMessage);
      }

      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    handleLogin: loginmMutation.mutateAsync,
    isLoading: loginmMutation.isPending,
    isError: loginmMutation.isError,
    error: loginmMutation.error,
  };
};
