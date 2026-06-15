'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/button';
import Icon, { IconProps } from '@/components/ui/icon';
import { useResendVerificationEmail } from '@/lib/hooks/auth/useResendVerificationEmail';
import { useVerifyEmailMutation } from '@/lib/hooks/auth/useVerifyEmail';
import { LOGIN_PATH, ROOT_PATH } from '@/routes';

type VerificationStatus = 'loading' | 'success' | 'expired' | 'error';

interface VerificationProps {
  token?: string;
  email?: string;
}

interface StateConfig {
  icon: IconProps['icon'] | React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const stateConfig: Record<VerificationStatus, Partial<StateConfig>> = {
  loading: {
    iconBg: 'bg-secondary-100',
    title: 'Verifying...',
    description: 'Please wait while we verify your email address.',
  },
  success: {
    icon: 'TbCircleCheckFilled',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    description:
      'Your email has been successfully verified. You can now access all features of Indigo Insight.',
  },
  expired: {
    icon: 'TbClockHour4',
    iconBg: 'bg-tertiary-100',
    iconColor: 'text-tertiary-600',
    description: 'The verification link has expired. Please request a new one.',
  },
  error: {
    icon: 'TbExclamationCircle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    description:
      'Something went wrong while verifying your email. Please try again or contact our support team if the problem persists.',
  },
} as const;

const Verification = ({ token, email }: VerificationProps) => {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  const { data, error, isLoading } = useVerifyEmailMutation(token);
  const {
    mutate: resendVerificationEmail,
    isPending: resendIsLoading,
    error: resendError,
  } = useResendVerificationEmail();

  // mapping status
  const status: VerificationStatus = useMemo(() => {
    if (isLoading) {
      return 'loading';
    }
    if (error) {
      return error.message?.includes('expired') ? 'expired' : 'error';
    }
    if (data?.success) {
      return 'success';
    }
    return 'loading';
  }, [data, error, isLoading]);

  // get config by status
  const config = stateConfig[status];

  // get message by status
  const message = useMemo(() => {
    if (status === 'success') {
      return data?.message || config?.title;
    }
    if (status === 'error' || status === 'expired') {
      if (resent) return 'Verification email resent!\nCheck your inbox.';
      if (resendError) return resendError.message;
      return error?.message || config?.title;
    }
    return config?.title;
  }, [status, data, error, config, resent, resendError]);

  // redirect to home if success
  useEffect(() => {
    if (!data?.success) {
      return;
    }

    signIn('magic-link', {
      userId: data?.data?.userId,
      redirect: false,
    });

    const timer = setTimeout(() => {
      router.replace(ROOT_PATH);
    }, 3000);

    return () => clearTimeout(timer);
  }, [data, router]);

  return (
    <div className="relative w-[500px] overflow-hidden rounded-xl bg-white p-6 text-center drop-shadow">
      <div
        className={classNames(
          'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
          config?.iconBg
        )}
      >
        {status === 'loading' ? (
          <div className="flex items-end gap-1.5">
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-400"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-300"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        ) : (
          <Icon
            icon={
              resent
                ? 'TbCircleCheckFilled'
                : (config?.icon as IconProps['icon'])
            }
            size={40}
            className={config?.iconColor}
          />
        )}
      </div>

      <h1 className="mb-2 text-2xl font-bold whitespace-pre-line text-gray-900">
        {message}
      </h1>

      <p className="mb-6 text-gray-600">{config?.description}</p>

      {status === 'expired' && (
        <div className="space-y-2">
          <Button
            preffixIcon="TbMail"
            fullWidth
            label={resent ? 'Email Resent!' : 'Resend Verification Email'}
            onClick={() => {
              if (!email) return;
              resendVerificationEmail(email, {
                onSuccess: () => setResent(true),
              });
            }}
            isLoading={resendIsLoading}
            disabled={resent}
          />
          <Button
            preffixIcon="TbArrowLeft"
            fullWidth
            label="Back to Login"
            variant="ghost"
            link={LOGIN_PATH}
          />
        </div>
      )}

      {status === 'error' && (
        <Button
          link={LOGIN_PATH}
          preffixIcon="TbArrowLeft"
          fullWidth
          label="Back to Login"
        />
      )}
    </div>
  );
};

export default Verification;
