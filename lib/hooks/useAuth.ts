import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import axiosInstance from '../axios';
import { LoginInput, RegisterInput } from '../types/auth.types';
import { handleApiError } from '../utils/error-handler';

const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

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
        setError(result.error);
      }

      if (result?.ok) {
        router.push('/');
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
        callbackUrl: '/',
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
      const response = await axiosInstance.post('/auth/register', request);

      if (response.status === 201) {
        const loginResult = await login({
          email: request.email,
          password: request.password,
        });
        return loginResult;
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
    login,
    loginWithOAuth,
  };
};

export default useAuth;
