import { NextRequest } from 'next/server';

import { resendVerificationEmail } from '@/lib/services/auth.service';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const POST = async (request: NextRequest) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    await resendVerificationEmail(email);

    return successResponse('Verification email resent successfully');
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
};
