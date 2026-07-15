import { z } from 'zod';

/**
 * @description Zod schema for validating profile update input.
 */
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().max(50),
  jobTitle: z.string().max(100).optional(),
  phoneNumber: z.string().max(30).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

/**
 * @description Zod schema for validating AI preferences input.
 */
export const preferencesSchema = z.object({
  language: z.enum(['id', 'en']),
  scoringStandard: z.enum(['ats', 'creative', 'executive']),
  highSensitivityMode: z.boolean(),
});

export type PreferencesSchema = z.infer<typeof preferencesSchema>;
