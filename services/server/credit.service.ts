import { Role } from '@/app/generated/prisma/enums';
import prisma from '@/lib/db';
import { CreditInfo } from '@/lib/types/dashboard.types';

const FREE_ANALYSIS_LIMIT = 4;

type CreditStatus = CreditInfo & {
  canAnalyze: boolean;
};

/**
 * @description Returns the user's analysis credit status.
 * - PRO and ADMIN are unlimited.
 * - FREE users are limited to a fixed number of non-failed analyses.
 * - `used` counts all resumes that are not FAILED (PENDING, PROCESSING, COMPLETED).
 *
 * @param {string} userId - The user ID.
 * @param {Role} role - The user role.
 * @returns {Promise<CreditStatus>} Credit status including used, limit, and canAnalyze flag.
 */
export const getCreditStatus = async (
  userId: string,
  role: Role
): Promise<CreditStatus> => {
  if (role !== 'FREE') {
    return { used: 0, limit: null, role, canAnalyze: true };
  }

  const used = await prisma.resume.count({
    where: {
      userId,
      status: { not: 'FAILED' },
    },
  });

  return {
    used,
    limit: FREE_ANALYSIS_LIMIT,
    role,
    canAnalyze: used < FREE_ANALYSIS_LIMIT,
  };
};
