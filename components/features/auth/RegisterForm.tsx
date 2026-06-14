'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Turnstile from '@/components/shared/turnstile';
import Button from '@/components/ui/button';
import { IconProps } from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { useRegisterMutation } from '@/lib/hooks/auth/useRegisterMutation';
import { RegisterInput } from '@/lib/types/auth.types';
import { registerSchema } from '@/schemas/auth.schemas';

const RegisterForm = React.memo(() => {
  const { handleRegister, isLoading } = useRegisterMutation();

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

  const {
    register,
    handleSubmit,
    reset,
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
    const res = await handleRegister({
      ...data,
      turnstileToken,
    });
    if (res?.success) {
      reset();
    }
  };

  return (
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
      <Turnstile
        onSuccess={(token) => setTurnstileToken(token)}
        onError={() => setTurnstileToken(null)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        label="Create Account"
        fullWidth
        disabled={!turnstileToken}
        isLoading={isLoading || isSubmitting}
      />
    </form>
  );
});

RegisterForm.displayName = 'RegisterForm';

export default RegisterForm;
