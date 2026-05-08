import z from 'zod';

import { loginSchema, registerSchema } from '../validations/auth.validation';

export type RegisterInput = z.infer<typeof registerSchema> & {
  turnstileToken?: string | null;
};
export type LoginInput = z.infer<typeof loginSchema> & {
  turnstileToken?: string | null;
};
