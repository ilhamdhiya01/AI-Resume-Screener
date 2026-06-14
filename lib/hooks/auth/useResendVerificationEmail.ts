import { useMutation } from '@tanstack/react-query';

import { resendVerifyEmail } from '@/services/client/auth.service';

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerifyEmail(email),
  });
};
