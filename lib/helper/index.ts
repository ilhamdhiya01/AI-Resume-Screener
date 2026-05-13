/**
 *
 * @param bytes
 * @returns formatted file size string (e.g., "1.2 MB", "500 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Mencari index unit (0 untuk Bytes, 1 untuk KB, dst)
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Mengembalikan hasil dengan 1 angka di belakang koma
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 *
 * @param date
 * @returns relative time string (e.g., "just now", "2 minutes ago", "1 hour ago", "2 days ago")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

/**
 * @description Helper to gradually increment progress from start to end
 * @param start - Starting percentage
 * @param end - Ending percentage
 * @param durationMs - Total duration in milliseconds
 * @param onProgress - Callback to update progress
 */
export const gradualProgress = async (
  start: number,
  end: number,
  durationMs: number,
  onProgress?: (progress: number) => Promise<void>
) => {
  const steps = end - start; // e.g. 20 - 0 = 20 steps
  const delayPerStep = durationMs / steps; // e.g. 10000 / 20 = 500ms per 1%

  for (let i = start + 1; i <= end; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayPerStep));
    if (onProgress) await onProgress(i);
  }
};
