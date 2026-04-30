import axios from 'axios';

interface ErrorHandlerOptions {
  defaultMessage?: string;
  logError?: boolean;
}

/**
 * Handle API errors in a consistent way
 * @param error - The error object
 * @param options - Configuration options
 * @returns User-friendly error message
 */
export const handleApiError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
): string => {
  const { defaultMessage = 'An error occurred', logError = true } = options;

  // Log error if enabled
  if (logError) {
    console.error('API Error:', error);
  }

  // Axios error
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      defaultMessage;

    return errorMessage;
  }

  // Generic Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown error
  return defaultMessage;
};
