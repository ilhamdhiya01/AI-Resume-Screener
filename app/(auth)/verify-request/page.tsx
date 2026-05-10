'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import Verification, {
  VerificationState,
} from '@/components/features/auth/Verification';
import { useAuth } from '@/lib/hooks';

const VerifyRequestContent = () => {
  const param = useSearchParams();
  const token = param.get('token');
  const email = param.get('email');

  const [resent, setResent] = useState(false);

  const { verifyEmail, success, error, isLoading, resendVerificationEmail } =
    useAuth();

  useEffect(() => {
    if (!token) return;
    verifyEmail(token);
  }, [token]);

  const getState = (): VerificationState => {
    if (isLoading) return { type: 'loading' };
    if (success) return { type: 'success', message: success };
    if (error?.includes('expired') || resent) {
      return {
        type: 'expired',
        message: resent
          ? 'Verification email resent! Check your inbox.'
          : error!,
        onResend: async () => {
          if (email) {
            const result = await resendVerificationEmail(email);
            if (result.success) {
              setResent(true);
            }
          }
        },
      };
    }
    if (error) return { type: 'error', message: error };
    return { type: 'loading' };
  };

  return (
    <div className="bg-primary-50 flex min-h-screen items-center justify-center">
      <Verification state={getState()} />
    </div>
  );
};

const VerifyRequestPage = () => {
  return (
    <Suspense>
      <VerifyRequestContent />
    </Suspense>
  );
};

export default VerifyRequestPage;
