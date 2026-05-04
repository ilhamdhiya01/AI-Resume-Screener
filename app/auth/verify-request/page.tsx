import Link from 'next/link';

const VerifyRequestPage = () => {
  return (
    <div className="bg-primary-50 flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="bg-primary-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            className="text-primary-700 h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Check Your Email
        </h1>

        <p className="mb-6 text-gray-600">
          We sent you a magic link to verify your email and log in. Click the
          link in the email to continue.
        </p>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">Didn&apos;t receive the email?</p>
          <p className="mt-1">
            Check your spam folder or{' '}
            <Link href="/auth/login" className="font-semibold underline">
              try again
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/login"
            className="text-primary-700 text-sm hover:underline"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyRequestPage;
