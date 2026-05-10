import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';

import Button from '@/components/ui/button';
import Icon, { IconProps } from '@/components/ui/icon';
import { LOGIN_PATH, ROOT_PATH } from '@/routes';

export type VerificationState =
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'expired'; message: string; onResend: () => void }
  | { type: 'error'; message: string };

interface VerificationProps {
  state: VerificationState;
}

interface StateConfig {
  icon: IconProps['icon'] | React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const stateConfig: Record<VerificationState['type'], Partial<StateConfig>> = {
  loading: {
    // icon: ,
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

const Verification = ({ state }: VerificationProps) => {
  const config = stateConfig[state?.type];
  const router = useRouter();

  if (state?.type === 'success') {
    setTimeout(() => {
      router.push(ROOT_PATH);
    }, 5000);
    // TODO: Add redirect logic here
  }

  return (
    <div className="relative w-[448px] overflow-hidden rounded-xl bg-white p-6 text-center drop-shadow">
      {/* Icon */}
      <div
        className={classNames(
          'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
          config?.iconBg
        )}
      >
        {state?.type === 'loading' ? (
          <BeatLoader size={10} />
        ) : (
          <Icon
            icon={config?.icon as IconProps['icon']}
            size={40}
            className={config?.iconColor}
          />
        )}
      </div>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        {state?.type === 'loading' ? config?.title : state?.message}
      </h1>

      {/* Description */}
      <p className="mb-6 text-gray-600">{config?.description}</p>

      {/* Actions */}
      {state?.type === 'expired' && (
        <div className="space-y-2">
          <Button
            preffixIcon="TbMail"
            fullWidth
            label="Resend Verification Email"
            onClick={state.onResend}
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

      {state?.type === 'error' && (
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
