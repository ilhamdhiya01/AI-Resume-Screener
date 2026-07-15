/**
 * @description Domain types for the Settings page (Profile & AI Preferences).
 */

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jobTitle: string;
}

export interface UserProfileInput {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface UserPreferences {
  language: 'id' | 'en';
  scoringStandard: 'ats' | 'creative' | 'executive';
  highSensitivityMode: boolean;
}

export type ScoringStandard = UserPreferences['scoringStandard'];
export type DocumentLanguage = UserPreferences['language'];
