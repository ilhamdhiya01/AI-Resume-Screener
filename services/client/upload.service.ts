import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { UploadResumeResponse } from '@/lib/types/upload-resume.type';
import { API_UPLOAD } from '@/routes';

export const uploadResume = async (
  file: File,
  jobDescription?: string
): Promise<ApiResponse<UploadResumeResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) {
    formData.append('jobDescription', jobDescription);
  }

  const response = await axiosInstance.post(API_UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
