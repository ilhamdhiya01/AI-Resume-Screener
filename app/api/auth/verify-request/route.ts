import { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { verificationRequest } from '@/services/server/auth.service';

export const POST = async (request: NextRequest) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const result = await verificationRequest(token);

    return successResponse(result.success, {
      userId: result.user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl;

    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const result = await verificationRequest(token);

    return successResponse(result.success, {
      userId: result.user.id,
      email: result.user.email,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
};
