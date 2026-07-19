import React from 'react';

import { auth } from '@/auth';

const Header = async () => {
  const session = await auth();
  const name = session?.user?.name || 'there';

  return (
    <div className="space-y-1 sm:space-y-2">
      <h1 className="text-2xl font-semibold text-slate-800 sm:text-3xl">
        Dashboard Overview
      </h1>
      <p className="text-sm text-slate-600 sm:text-base">
        Welcome back, {name}. Here&apos;s a summary of your recent AI candidate
        analysis.
      </p>
    </div>
  );
};

export default Header;
