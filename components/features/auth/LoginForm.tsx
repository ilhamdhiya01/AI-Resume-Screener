'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Turnstile from '@/components/shared/turnstile';
import Button from '@/components/ui/button';
import { IconProps } from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { useLoginMutation } from '@/lib/hooks/auth/useLoginMutation';
import { LoginInput } from '@/lib/types/auth.types';
import { loginSchema } from '@/schemas/auth.schemas';

const LoginForm = React.memo(() => {
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

  const { handleLogin, isLoading } = useLoginMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    const res = await handleLogin({ ...data, turnstileToken });
    if (!res?.error) {
      reset();
    }
  };

  return (
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
        isLoading={isLoading || isSubmitting}
      />
    </form>
  );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;
