'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { handleApiError } from '@/lib/errors/auth.error';
import { RegisterRequest } from '@/lib/types/auth.types';
import { notify } from '@/lib/utils/toast';
import { ROOT_CHECK_EMAIL_PATH } from '@/routes';
import { register } from '@/services/client/auth.service';

const useRegisterMutation = () => {
  const router = useRouter();
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: (response) => {
      if (response?.success) {
        notify({ type: 'success', title: 'Register successful' });
        router.replace(ROOT_CHECK_EMAIL_PATH);
      }
    },
    onError: (error) => {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Registration failed',
      });
      notify({ type: 'error', title: errorMessage });
    },
  });

  return {
    handleRegister: registerMutation.mutateAsync,
    isLoading: registerMutation.isPending,
    isError: registerMutation.isError,
    error: registerMutation.error,
  };
};

export default useRegisterMutation;
