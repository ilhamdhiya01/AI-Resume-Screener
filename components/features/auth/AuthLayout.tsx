import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
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
          <h2 className="text-center text-3xl font-bold">{title}</h2>
          <p className="text-neutral-700">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">{children}</div>
    </div>
  );
};
