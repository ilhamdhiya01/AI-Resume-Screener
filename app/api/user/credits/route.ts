import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { getCreditStatus } from '@/services/server/credit.service';

/**
 * @description Returns the current user's analysis credit status.
 *
 * - PRO and ADMIN: unlimited.
 * - FREE: limited number of non-failed analyses.
 */
export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.role) {
      return errorResponse('Unauthorized', 401);
    }

    const creditStatus = await getCreditStatus(
      session.user.id,
      session.user.role
    );

    return successResponse('Credit status retrieved', creditStatus, 200);
  } catch (error) {
    console.error('Credit status error:', error);
    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Failed to retrieve credit status',
      500
    );
  }
};
