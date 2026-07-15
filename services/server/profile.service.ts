import prisma from '@/lib/db';
import { UserProfile, UserProfileInput } from '@/lib/types/settings.types';

/**
 * @description Split a full name into first/last name for the UI.
 * @param {string | null} name - Full name from User record.
 * @returns {{ firstName: string; lastName: string }} Split names.
 */
const splitName = (
  name: string | null
): { firstName: string; lastName: string } => {
  if (!name) return { firstName: '', lastName: '' };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

/**
 * @description Retrieve user profile including Profile record.
 * @param {string} userId - User ID.
 * @returns {Promise<UserProfile>} Profile data.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { firstName, lastName } = splitName(user.name);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName,
    lastName,
    phoneNumber: user.profile?.phoneNumber ?? '',
    jobTitle: user.profile?.jobTitle ?? '',
  };
};

/**
 * @description Update user's name and profile fields (jobTitle, phoneNumber).
 * @param {string} userId - User ID.
 * @param {UserProfileInput} data - Profile input.
 * @returns {Promise<UserProfile>} Updated profile.
 */
export const updateUserProfile = async (
  userId: string,
  data: UserProfileInput
): Promise<UserProfile> => {
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: fullName,
      profile: {
        upsert: {
          create: {
            jobTitle: data.jobTitle || null,
            phoneNumber: data.phoneNumber || null,
          },
          update: {
            jobTitle: data.jobTitle || null,
            phoneNumber: data.phoneNumber || null,
          },
        },
      },
    },
  });

  return getUserProfile(userId);
};
