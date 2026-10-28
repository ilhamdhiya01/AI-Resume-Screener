import { useCallback } from 'react';

import { resumeFileUrl } from '@/routes';

/**
 * @description Downloads a resume through the authenticated file route. The
 * browser streams it straight to disk (`Content-Disposition: attachment`), so
 * the file is never buffered in page memory.
 */
const useDownloadResume = () => {
  const handleDownload = useCallback((resumeId: string) => {
    const link = document.createElement('a');
    link.href = resumeFileUrl(resumeId, true);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  return { handleDownload };
};

export default useDownloadResume;
