import axios from 'axios';
import { CredentialsSignin } from 'next-auth';

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

export class EmailNotFoundError extends CredentialsSignin {
  code = 'email_not_found';
}

export class InvalidPasswordError extends CredentialsSignin {
  code = 'invalid_password';
}

export class MissingCredentialsError extends CredentialsSignin {
  code = 'missing_credentials';
}

export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    email_not_found: 'Email is not registered',
    invalid_password: 'Invalid password',
    missing_credentials: 'Email and password are required',
    CredentialsSignin: 'Invalid email or password',
    Configuration: 'Server error. Please try again later.',
    OAuthAccountNotLinked: 'This email is already linked to another account',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};
