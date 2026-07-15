import { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { profileSchema } from '@/schemas/settings.schemas';
import {
  getUserProfile,
  updateUserProfile,
} from '@/services/server/profile.service';

export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const profile = await getUserProfile(session.user.id);
    return successResponse('Profile retrieved', profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve profile',
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
    const validatedBody = profileSchema.parse(body);
    const profile = await updateUserProfile(session.user.id, validatedBody);
    return successResponse('Profile updated', profile);
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update profile',
      500
    );
  }
};
