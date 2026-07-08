import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import {
  RegisterRequest,
  ResendVerifyEmailResponse,
  VerifyEmailResponse,
} from '@/lib/types/auth.types';
import {
  API_AUTH_REGISTER,
  API_AUTH_RESEND_VERIFY_REQUEST,
  API_AUTH_VERIFY_REQUEST,
} from '@/routes';

export const register = async (data: RegisterRequest) => {
  const response = await axiosInstance.post(API_AUTH_REGISTER, data);
  return response.data;
};

export const verifyEmail = async (
  token: string
): Promise<ApiResponse<VerifyEmailResponse>> => {
  const response = await axiosInstance.get(API_AUTH_VERIFY_REQUEST, {
    params: { token },
  });

  return response.data;
};

export const resendVerifyEmail = async (
  email: string
): Promise<ResendVerifyEmailResponse> => {
  const response = await axiosInstance.get(API_AUTH_RESEND_VERIFY_REQUEST, {
    params: { email },
  });

  return response.data;
};
