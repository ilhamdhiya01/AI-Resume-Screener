import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/lib/types/api.types';
import { UserPreferences } from '@/lib/types/settings.types';
import { API_USER_PREFERENCES } from '@/routes';

/**
 * @description Fetch the authenticated user's AI preferences.
 * @returns {Promise<UserPreferences>} AI preferences.
 */
export const getPreferences = async (): Promise<UserPreferences> => {
  const response =
    await axiosInstance.get<ApiResponse<UserPreferences>>(API_USER_PREFERENCES);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to load preferences');
  }
  return response.data.data;
};

/**
 * @description Update the authenticated user's AI preferences.
 * @param {UserPreferences} payload - New preferences.
 * @returns {Promise<UserPreferences>} Updated preferences.
 */
export const updatePreferences = async (
  payload: UserPreferences
): Promise<UserPreferences> => {
  const response = await axiosInstance.patch<ApiResponse<UserPreferences>>(
    API_USER_PREFERENCES,
    payload
  );
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to update preferences');
  }
  return response.data.data;
};
