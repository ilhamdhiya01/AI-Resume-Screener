import z from 'zod';

import { loginSchema, registerSchema } from '../../schemas/auth.schemas';

export type RegisterInput = z.infer<typeof registerSchema> & {
  turnstileToken?: string | null;
};
export type LoginInput = z.infer<typeof loginSchema> & {
  turnstileToken?: string | null;
};

export type LoginRequest = LoginInput;
export type RegisterRequest = RegisterInput;

export type VerifyEmailResponse = {
  userId: string;
  email: string;
};

export type ResendVerifyEmailResponse = {
  success: boolean;
  message: string;
};
