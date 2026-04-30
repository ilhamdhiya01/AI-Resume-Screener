'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { IconProps } from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks';
import { RegisterInput } from '@/lib/types/auth.types';
import { registerSchema } from '@/lib/validations/auth.validation';

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

  const {
    register: handleRegister,
    loginWithOAuth,
    error: authError,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    await handleRegister(data);
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start analyzing resumes with AI precision."
      error={authError}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          {...register('name')}
          prefix={{
            icon: 'TbUser',
          }}
          fullWidth
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
        />
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          label="Create Account"
          fullWidth
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
            Already have an account?{' '}
            <Link className="text-primary-700 font-semibold" href="/auth/login">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;
