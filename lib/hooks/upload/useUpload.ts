import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

import { UploadResumeRequest } from '@/lib/types/upload-resume.type';
import { ANALYSIS_PATH } from '@/routes';
import { uploadResume } from '@/services/client/upload.service';
import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

export const useUploadResume = () => {
  const router = useRouter();
  const { setFile, setJobDescription } = useAnalysisStore(
    useShallow((state) => ({
      setFile: state.setFile,
      setJobDescription: state.setJobDescription,
    }))
  );
  const loginmMutation = useMutation({
    mutationFn: (payload: UploadResumeRequest) =>
      uploadResume(payload.file, payload.jobDescription),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { resumeId } = response.data;
        router.replace(`${ANALYSIS_PATH}/${resumeId}`);
        setFile(null);
        setJobDescription('');
        toast.success(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    uploadResume: loginmMutation.mutate,
    isUploading: loginmMutation.isPending,
  };
};
