'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { handleApiError } from '@/lib/errors/auth.error';
import { RegisterRequest } from '@/lib/types/auth.types';
import { ROOT_CHECK_EMAIL_PATH } from '@/routes';
import { register } from '@/services/client/auth.service';

const useRegisterMutation = () => {
  const router = useRouter();
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: (response) => {
      if (response?.success) {
        toast.success('Register successful');
        router.replace(ROOT_CHECK_EMAIL_PATH);
      }
    },
    onError: (error) => {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Registration failed',
      });
      toast.error(errorMessage);
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
