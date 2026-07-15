import React from 'react';

import { auth } from '@/auth';

const Header = async () => {
  const session = await auth();
  const name = session?.user?.name || 'there';

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold text-slate-800">
        Dashboard Overview
      </h1>
      <p className="text-slate-600">
        Welcome back, {name}. Here&apos;s a summary of your recent AI candidate
        analysis.
      </p>
    </div>
  );
};

export default Header;
