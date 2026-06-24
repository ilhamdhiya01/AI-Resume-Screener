import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types';
import { ResumeHistoryItem } from '@/lib/types/resume-history.types';
import { API_RESUME, API_RESUME_HISTORY } from '@/routes';

export const getResumeHistory = async (
  page: number,
  status?: string,
  search?: string
): Promise<ApiResponse<PaginatedResponse<ResumeHistoryItem>>> => {
  const response = await axiosInstance.get(API_RESUME_HISTORY, {
    params: {
      page,
      status,
      search,
    },
  });
  return response.data;
};

export const downloadResume = async (
  filePath: string
): Promise<ApiResponse<{ signedUrl: string }>> => {
  const response = await axiosInstance.post(`${API_RESUME}/signed-url`, {
    filePath,
  });
  return response.data;
};
