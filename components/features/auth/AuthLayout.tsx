import React from 'react';

import { Auth } from '.';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  error?: string | null;
  success?: string | null;
}

const Layout = ({
  children,
  title,
  subtitle,
  error,
  success,
}: AuthLayoutProps) => {
  return (
    <div className="before:bg-primary-800 relative w-[448px] overflow-hidden rounded-xl bg-white p-6 drop-shadow before:absolute before:inset-0 before:top-0 before:h-1.5 before:w-full">
      <Auth.Header title={title} subtitle={subtitle} />
      <Auth.Message error={error} success={success} />
      <div className="mt-8">{children}</div>
    </div>
  );
};

export default Layout;
