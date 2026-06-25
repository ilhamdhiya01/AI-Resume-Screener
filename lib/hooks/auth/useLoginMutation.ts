import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { getAuthErrorMessage } from '@/lib/errors/auth.error';
import { LoginRequest } from '@/lib/types/auth.types';
import { notify } from '@/lib/utils/toast';
import { ROOT_PATH } from '@/routes';

const useLoginMutation = () => {
  const router = useRouter();
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
        return notify({
          type: 'error',
          title: errorMessage,
          description: 'Please try again with correct credentials',
        });
      }

      notify({
        type: 'success',
        title: 'Login successful',
        description: 'Welcome back!',
      });
      router.replace(ROOT_PATH);
    },
    onError: (error) => {
      notify({ type: 'error', title: error.message });
    },
  });

  return {
    handleLogin: loginmMutation.mutateAsync,
    isLoading: loginmMutation.isPending,
    isError: loginmMutation.isError,
    error: loginmMutation.error,
  };
};

export default useLoginMutation;
