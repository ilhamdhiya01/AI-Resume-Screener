import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LOGIN_PATH } from '@/routes';

const CheckEmailPage = () => {
  return (
    <div className="bg-primary-50 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white p-5 text-center drop-shadow sm:p-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 sm:h-20 sm:w-20">
          <Icon icon="TbMail" size={32} className="text-blue-600" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
          Check Your Email
        </h1>

        <p className="mb-6 text-sm text-gray-600 sm:text-base">
          We sent you a verification link to your email address. Click the link
          to verify your account and get started.
        </p>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">Didn&apos;t receive the email?</p>
          <p className="mt-1">
            Check your spam folder or try registering again.
          </p>
        </div>

        <div className="mt-6">
          <Button
            preffixIcon="TbArrowLeft"
            fullWidth
            label="Back to Login"
            variant="ghost"
            link={LOGIN_PATH}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
