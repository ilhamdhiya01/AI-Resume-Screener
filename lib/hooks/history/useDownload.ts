import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { downloadResume } from '@/services/client/resume-history.service';

interface DownloadPayload {
  filePath: string;
  fileName: string;
}

const useDownloadResume = () => {
  const downloadMutation = useMutation({
    mutationFn: async ({ filePath, fileName }: DownloadPayload) => {
      const result = await downloadResume(filePath);
      const signedUrl = result.data?.signedUrl;

      if (!signedUrl) {
        throw new Error('Failed to get download URL');
      }

      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return result;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    handleDownload: downloadMutation.mutate,
    isDownloading: downloadMutation.isPending,
  };
};

export default useDownloadResume;
