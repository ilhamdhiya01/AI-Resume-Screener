import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { UserProfile, UserProfileInput } from '@/lib/types/settings.types';
import { API_USER_PROFILE } from '@/routes';

/**
 * @description Fetch the authenticated user's profile.
 * @returns {Promise<UserProfile>} User profile data.
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response =
    await axiosInstance.get<ApiResponse<UserProfile>>(API_USER_PROFILE);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to load profile');
  }
  return response.data.data;
};

/**
 * @description Update the authenticated user's profile.
 * @param {UserProfileInput} payload - Profile fields to update.
 * @returns {Promise<UserProfile>} Updated profile.
 */
export const updateProfile = async (
  payload: UserProfileInput
): Promise<UserProfile> => {
  const response = await axiosInstance.patch<ApiResponse<UserProfile>>(
    API_USER_PROFILE,
    payload
  );
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to update profile');
  }
  return response.data.data;
};
