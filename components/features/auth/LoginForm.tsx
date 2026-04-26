'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { IconProps } from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

const LoginForm = () => {
  const [hide, setHide] = useState<{
    icon: IconProps['icon'];
    type: 'text' | 'password';
  }>({
    icon: 'TbEyeOff',
    type: 'password',
  });

  const handleShowPassword = () => {
    setHide((prev) => ({
      icon: prev.icon === 'TbEye' ? 'TbEyeOff' : 'TbEye',
      type: prev.type === 'password' ? 'text' : 'password',
    }));
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', {
      callbackUrl: '/', // redirect setelah login
    });
  };

  return (
    <div className="w-[448px] rounded-xl bg-white p-6 drop-shadow">
      <div className="flex flex-col gap-3 text-center">
        <div className="mx-auto inline-flex items-center gap-2">
          <Image src="/icons/Logo.svg" alt="Logo" width={27} height={27} />
          <h1 className="text-primary-800 text-2xl font-bold">
            Indigo Insight
          </h1>
        </div>
        <div>
          <h2 className="text-center text-3xl font-bold">Welcome back</h2>
          <p className="text-neutral-700">
            Sign in to your account to continue
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <Input
          prefix={{
            icon: 'TbMail',
          }}
          fullWidth
          label="Email"
          placeholder="Enter your email"
        />
        <Input
          fullWidth
          label="Password"
          placeholder="Enter your password"
          type={hide.type}
          prefix={{
            icon: hide.icon,
            onClick: handleShowPassword,
          }}
        />
        <Button variant="contained" color="primary" label="Login" fullWidth />

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-gray-300" />
          <span className="mx-4 shrink text-sm font-medium text-gray-500">
            OR
          </span>
          <div className="grow border-t border-gray-300" />
        </div>

        <Button
          preffixIcon="FcGoogle"
          variant="outlined"
          color="neutral"
          label="Continue with Google"
          fullWidth
          onClick={handleGoogleSignIn}
        />

        <div className="text-center">
          <p className="text-neutral-700">
            Don&apos;t have an account?{' '}
            <Link className="text-primary-700 font-semibold" href="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
