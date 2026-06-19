import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { ResumeJobStatus } from '@/lib/types/resume-analysis.types';
import { API_RESUME_STATUS } from '@/routes';

export const getJobStatus = async (
  resumeId: string
): Promise<ApiResponse<ResumeJobStatus>> => {
  const response = await axiosInstance.get(`${API_RESUME_STATUS}/${resumeId}`);
  return response.data;
};

export const retryJob = async (
  resumeId: string
): Promise<ApiResponse<unknown>> => {
  const response = await axiosInstance.get(`${API_RESUME_STATUS}/${resumeId}`, {
    params: { retry: true },
  });
  return response.data;
};

export const cancelJob = async (
  resumeId: string
): Promise<ApiResponse<unknown>> => {
  const response = await axiosInstance.get(`${API_RESUME_STATUS}/${resumeId}`, {
    params: { cancel: true },
  });
  return response.data;
};
