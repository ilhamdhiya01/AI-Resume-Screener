import { NextRequest } from 'next/server';
import z from 'zod';

import { RegisterRequest } from '@/lib/types/auth.types';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { registerSchema } from '@/schemas/auth.schemas';
import { registerUser } from '@/services/server/auth.service';

export const POST = async (request: NextRequest) => {
  try {
    const body: RegisterRequest = await request.json();

    const validatedData = registerSchema.parse(body);

    const { user, verificationToken } = await registerUser({
      ...validatedData,
      turnstileToken: body.turnstileToken,
    });

    return successResponse(
      'Confirmation email sent. Please check your email.',
      { user, verificationToken },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
};
