import { useMutation } from '@tanstack/react-query';

import { notify } from '@/lib/utils/toast';
import { exportResumeHistoryCSV } from '@/services/client/resume-history.service';

interface ExportFilters {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * @description Triggers a browser download of the resume history CSV.
 * @param {Blob} blob - The CSV blob from the API.
 * @param {string} fileName - The desired download file name.
 */
const triggerDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * @description Hook to export resume history as CSV with loading state.
 * @returns {{ handleExport: (filters: ExportFilters) => void, isExporting: boolean }}
 */
export const useExportCSV = () => {
  const mutation = useMutation({
    mutationFn: (filters: ExportFilters) =>
      exportResumeHistoryCSV(
        filters.status,
        filters.search,
        filters.dateFrom,
        filters.dateTo
      ),
    onSuccess: (blob) => {
      triggerDownload(blob, 'resume-history.csv');
      notify({ type: 'success', title: 'CSV exported successfully' });
    },
    onError: (error: Error) => {
      notify({ type: 'error', title: error.message || 'Failed to export CSV' });
    },
  });

  return {
    handleExport: mutation.mutate,
    isExporting: mutation.isPending,
  };
};

export default useExportCSV;
