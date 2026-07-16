'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React from 'react';

import Button from '@/components/ui/button';
import { LOGIN_PATH, REGISTER_PATH, ROOT_PATH } from '@/routes';

import Header from './Header';
import { TurnstileProvider, useTurnstile } from './TurnstileContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const LayoutContent = ({ children }: AuthLayoutProps) => {
  const { turnstileToken } = useTurnstile();
  const pathName = usePathname();

  const isLogin = pathName === LOGIN_PATH;
  const title = isLogin ? 'Welcome back' : 'Create an account';
  const subtitle = isLogin
    ? 'Sign in to your account to continue'
    : 'Start analyzing resumes with AI precision.';

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="before:bg-primary-800 relative w-[448px] overflow-hidden rounded-xl bg-white p-6 drop-shadow before:absolute before:inset-0 before:top-0 before:h-1.5 before:w-full">
        <Header title={title} subtitle={subtitle} />
        <div className="mt-8">{children}</div>
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
          disabled={!turnstileToken}
          onClick={() =>
            signIn('google', {
              callbackUrl: ROOT_PATH,
            })
          }
        />
        <div className="mt-4 text-center">
          <p className="text-neutral-700">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              className="text-primary-700 font-semibold"
              href={isLogin ? REGISTER_PATH : LOGIN_PATH}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }: AuthLayoutProps) => (
  <TurnstileProvider>
    <LayoutContent>{children}</LayoutContent>
  </TurnstileProvider>
);

export default Layout;
