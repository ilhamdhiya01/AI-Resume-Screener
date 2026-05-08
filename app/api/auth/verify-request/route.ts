import { NextRequest } from 'next/server';

import { verificationRequest } from '@/lib/services/auth.service';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const POST = async (request: NextRequest) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const result = await verificationRequest(token);

    return successResponse('Email verified successfully', {
      userId: result.user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
};
