import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { getSignedUrl } from '@/lib/services/upload.service';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { filePath } = await request.json();

    if (!filePath) {
      return errorResponse('File path is required', 400);
    }

    // ✅ Security: Check if file belongs to user
    if (!filePath.startsWith(session.user.id)) {
      return errorResponse('Access denied', 403);
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await getSignedUrl(filePath, 3600);

    return successResponse('Signed URL generated', { signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate signed URL',
      500
    );
  }
};
