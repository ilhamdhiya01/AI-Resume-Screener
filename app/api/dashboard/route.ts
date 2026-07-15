import { auth } from '@/auth';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { getDashboardData } from '@/services/server/dashboard.service';

export const GET = async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId || !role) {
      return errorResponse('Unauthorized', 401);
    }

    const data = await getDashboardData({ userId, role });

    return successResponse('Dashboard data retrieved', data, 200);
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve dashboard',
      500
    );
  }
};
