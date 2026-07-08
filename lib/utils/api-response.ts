import { NextResponse } from 'next/server';

interface ApiResponseParams<T> {
  success: boolean;
  data?: T;
  message: string;
  status?: number;
}

/**
 * @description Creates a consistent API response format
 * @param params - The response parameters
 * @returns NextResponse with standardized JSON structure
 */
export const apiResponse = <T>({
  success,
  data = null as T,
  message,
  status = 200,
}: ApiResponseParams<T>) => {
  return NextResponse.json({ success, data, message }, { status });
};

/**
 * @description Creates a success API response
 * @param message - Success message
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success format
 */
export const successResponse = <T>(message: string, data?: T, status = 200) => {
  return apiResponse({ success: true, data: data ?? null, message, status });
};

/**
 * @description Creates an error API response
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error format
 */
export const errorResponse = (message: string, status = 400) => {
  return apiResponse({ success: false, data: null, message, status });
};
