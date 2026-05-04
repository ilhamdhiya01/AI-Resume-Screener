import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { API_AUTH_REGISTER, ROOT_PATH } from '@/routes';

import axiosInstance from '../axios';
import { getAuthErrorMessage, handleApiError } from '../errors/auth.error';
import { generateVerificationTokenByEmail } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../types/auth.types';

const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const login = async (request: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: request.email,
        password: request.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = getAuthErrorMessage(result.code as string);
        setError(errorMessage);
      } else {
        router.push(ROOT_PATH);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Login failed',
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      signIn(provider, {
        callbackUrl: ROOT_PATH,
      });
    } catch (error) {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Login failed',
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (request: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(API_AUTH_REGISTER, request);

      if (response.status === 201) {
        setSuccess(response.data.message);
        return response.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Registration failed',
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    register,
    clearError,
    clearSuccess,
    success,
    login,
    loginWithOAuth,
  };
};

export default useAuth;
