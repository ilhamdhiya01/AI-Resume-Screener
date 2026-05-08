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

  // Axios error — read from standardized { success, data, message } format
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message || error.message || defaultMessage;

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

export class InvalidLoginError extends CredentialsSignin {
  code = 'invalid_credentials';
}

export class UnverifiedEmailError extends CredentialsSignin {
  code = 'email_unverified';
}

export class EmailAlreadyExistsError extends CredentialsSignin {
  code = 'email_already_exists';
}

export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    email_not_found: 'Email is not registered',
    invalid_password: 'Invalid password',
    missing_credentials: 'Email and password are required',
    invalid_credentials: 'Invalid email or password',
    AccessDenied: 'Email is not verified',
    email_already_exists: 'Email is already registered',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};
