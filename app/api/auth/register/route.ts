import { NextRequest } from 'next/server';
import z from 'zod';

import { registerUser } from '@/lib/services/auth.service';
import { RegisterInput } from '@/lib/types/auth.types';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { verifyTurnstileToken } from '@/lib/utils/turnstile';
import { registerSchema } from '@/lib/validations/auth.validation';

export const POST = async (request: NextRequest) => {
  try {
    const body: RegisterInput = await request.json();

    if (!body.turnstileToken) {
      return errorResponse('Captcha verification required', 400);
    }

    const isValidCaptcha = await verifyTurnstileToken(body.turnstileToken);
    if (!isValidCaptcha) {
      return errorResponse('Invalid captcha', 400);
    }

    const validatedData = registerSchema.parse(body);

    const { user, verificationToken } = await registerUser(validatedData);

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
