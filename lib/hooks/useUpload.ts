import { useState } from 'react';

import axiosInstance from '../axios';

interface UploadResponse {
  resumeId: string;
  signedUrl: string;
  path: string;
  fileName: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadResume = async (file: File): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const response = await axiosInstance.post('/upload/signed-url', {
        filePath,
      });
      return response.data.data.signedUrl;
    } catch (err) {
      console.error('Failed to get signed URL:', err);
      return null;
    }
  };

  return {
    uploadResume,
    getFileSignedUrl,
    isUploading,
    error,
    progress,
  };
};

export default useUpload;
