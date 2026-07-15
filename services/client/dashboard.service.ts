import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { DashboardData } from '@/lib/types/dashboard.types';
import { API_DASHBOARD } from '@/routes';

export const getDashboard = async (): Promise<ApiResponse<DashboardData>> => {
  const response =
    await axiosInstance.get<ApiResponse<DashboardData>>(API_DASHBOARD);
  return response.data;
};
