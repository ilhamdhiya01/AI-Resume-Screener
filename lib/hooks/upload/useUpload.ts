import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { UploadResumeRequest } from '@/lib/types/upload-resume.type';
import { notify } from '@/lib/utils/toast';
import { ANALYSIS_PATH } from '@/routes';
import { uploadResume } from '@/services/client/upload.service';
import { useAnalysisStore } from '@/stores';

const useUploadResume = () => {
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
        notify({ type: 'success', title: response.message });
      }
    },
    onError: (error) => {
      notify({ type: 'error', title: error.message });
    },
  });

  return {
    uploadResume: loginmMutation.mutate,
    isUploading: loginmMutation.isPending,
  };
};

export default useUploadResume;
