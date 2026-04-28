'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import { IconProps } from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

import { AuthLayout } from './AuthLayout';

const RegisterForm = () => {
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
      callbackUrl: '/',
    });
  };
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start analyzing resumes with AI precision."
    >
      <Input
        prefix={{
          icon: 'TbUser',
        }}
        fullWidth
        label="Full Name"
        placeholder="Enter your full name"
      />
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
      <div className="mt-4 text-center">
        <p className="text-neutral-700">
          Already have an account?{' '}
          <Link className="text-primary-700 font-semibold" href="/auth/login">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterForm;
