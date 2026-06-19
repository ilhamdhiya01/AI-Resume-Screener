import { Suspense } from 'react';

import Verification from '@/components/features/auth/Verification'; // VerificationState,

interface VerifyRequestPageProps {
  searchParams: {
    token?: string;
    email?: string;
  };
}

const VerifyRequestPage = async ({ searchParams }: VerifyRequestPageProps) => {
  const { token, email } = await searchParams;
  return (
    <div className="bg-primary-50 flex min-h-screen items-center justify-center">
      <Suspense>
        <Verification token={token} email={email} />
      </Suspense>
    </div>
  );
};

export default VerifyRequestPage;
