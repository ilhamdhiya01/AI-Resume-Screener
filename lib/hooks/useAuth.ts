import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import {
  API_AUTH_REGISTER,
  API_AUTH_RESEND_VERIFY_REQUEST,
  API_AUTH_VERIFY_REQUEST,
  ROOT_CHECK_EMAIL_PATH,
  ROOT_PATH,
} from '@/routes';

import axiosInstance from '../axios';
import { getAuthErrorMessage, handleApiError } from '../errors/auth.error';
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
        ...request,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = getAuthErrorMessage(
          (result.code as string) ?? result.error
        );
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

      if (response.data.success) {
        router.push(ROOT_CHECK_EMAIL_PATH);
      }

      return null;
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

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axiosInstance.post(API_AUTH_VERIFY_REQUEST, {
        token,
      });

      const {
        data: { userId },
      } = response.data;

      // if verify is successful, sign in the user with magic-link
      const result = await signIn('magic-link', {
        userId,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = getAuthErrorMessage(result.error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSuccess(response.data.message);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Verification failed',
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        API_AUTH_RESEND_VERIFY_REQUEST,
        {
          email,
        }
      );

      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Resend verification email failed',
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
    verifyEmail,
    resendVerificationEmail,
  };
};

export default useAuth;
