import { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { preferencesSchema } from '@/schemas/settings.schemas';
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/services/server/preferences.service';

export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const preferences = await getUserPreferences(session.user.id);
    return successResponse('Preferences retrieved', preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve preferences',
      500
    );
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validatedBody = preferencesSchema.parse(body);
    const preferences = await updateUserPreferences(
      session.user.id,
      validatedBody
    );
    return successResponse('Preferences updated', preferences);
  } catch (error) {
    console.error('Update preferences error:', error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update preferences',
      500
    );
  }
};
