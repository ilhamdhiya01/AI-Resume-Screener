'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Turnstile from '@/components/shared/turnstile';
import Button from '@/components/ui/button';
import { IconProps } from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { useAuth } from '@/lib/hooks';
import { LoginInput } from '@/lib/types/auth.types';
import { loginSchema } from '@/lib/validations/auth.validation';
import { REGISTER_PATH } from '@/routes';

import { Auth } from '.';

const LoginForm = () => {
  const [hide, setHide] = useState<{
    icon: IconProps['icon'];
    type: 'text' | 'password';
  }>({
    icon: 'TbEyeOff',
    type: 'password',
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleShowPassword = () => {
    setHide((prev) => ({
      icon: prev.icon === 'TbEye' ? 'TbEyeOff' : 'TbEye',
      type: prev.type === 'password' ? 'text' : 'password',
    }));
  };

  const { login, loginWithOAuth, error: authError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    await login({ ...data, turnstileToken });
  };

  return (
    <Auth
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      error={authError}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          {...register('email')}
          prefix={{
            icon: 'TbMail',
          }}
          fullWidth
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
        />
        <Input
          {...register('password')}
          fullWidth
          label="Password"
          placeholder="Enter your password"
          type={hide.type}
          prefix={{
            icon: hide.icon,
            onClick: handleShowPassword,
          }}
          error={errors.password?.message}
        />
        <Turnstile
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken(null)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          label="Login"
          fullWidth
          disabled={!turnstileToken}
          isLoading={isSubmitting}
        />
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
          onClick={() => loginWithOAuth('google')}
        />
        <div className="mt-4 text-center">
          <p className="text-neutral-700">
            Don&apos;t have an account?{' '}
            <Link
              className="text-primary-700 font-semibold"
              href={REGISTER_PATH}
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Auth>
  );
};

export default LoginForm;
