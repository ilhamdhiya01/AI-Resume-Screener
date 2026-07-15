import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { CreditInfo } from '@/lib/types/dashboard.types';
import { API_USER_CREDITS } from '@/routes';

export type CreditStatusResponse = CreditInfo & {
  canAnalyze: boolean;
};

export const getCreditStatus = async (): Promise<
  ApiResponse<CreditStatusResponse>
> => {
  const response =
    await axiosInstance.get<ApiResponse<CreditStatusResponse>>(
      API_USER_CREDITS
    );
  return response.data;
};
