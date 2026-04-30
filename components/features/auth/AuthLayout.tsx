import Image from 'next/image';
import React from 'react';

import Icon from '@/components/ui/Icon';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  error?: string | null;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  error,
}: AuthLayoutProps) => {
  return (
    <div className="before:bg-primary-800 relative w-[448px] overflow-hidden rounded-xl bg-white p-6 drop-shadow before:absolute before:inset-0 before:top-0 before:h-1.5 before:w-full">
      <div className="flex flex-col gap-3 text-center">
        <div className="mx-auto inline-flex items-center gap-2">
          <Image src="/icons/Logo.svg" alt="Logo" width={27} height={27} />
          <h1 className="text-primary-800 text-2xl font-bold">
            Indigo Insight
          </h1>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-center text-3xl font-bold">{title}</h2>
          <p className="text-neutral-700">{subtitle}</p>
        </div>
      </div>
      {error && (
        <div className="relative mt-4 rounded-lg border border-red-300 bg-red-100 py-2.5 pr-2.5 pl-10 text-red-500">
          <Icon
            icon="TbAlertCircle"
            className="absolute top-3 left-3 shrink-0"
            size={20}
          />
          <p>{error}</p>
        </div>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
};
