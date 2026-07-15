import prisma from '@/lib/db';
import { UserPreferences } from '@/lib/types/settings.types';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'id',
  scoringStandard: 'ats',
  highSensitivityMode: false,
};

/**
 * @description Retrieve user AI preferences. Creates default record if missing.
 * @param {string} userId - User ID.
 * @returns {Promise<UserPreferences>} User preferences.
 */
export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences> => {
  const preference = await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...DEFAULT_PREFERENCES },
    update: {},
  });

  return {
    language: preference.language as UserPreferences['language'],
    scoringStandard:
      preference.scoringStandard as UserPreferences['scoringStandard'],
    highSensitivityMode: preference.highSensitivityMode,
  };
};

/**
 * @description Update user AI preferences.
 * @param {string} userId - User ID.
 * @param {UserPreferences} data - New preferences.
 * @returns {Promise<UserPreferences>} Updated preferences.
 */
export const updateUserPreferences = async (
  userId: string,
  data: UserPreferences
): Promise<UserPreferences> => {
  const preference = await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  });

  return {
    language: preference.language as UserPreferences['language'],
    scoringStandard:
      preference.scoringStandard as UserPreferences['scoringStandard'],
    highSensitivityMode: preference.highSensitivityMode,
  };
};
