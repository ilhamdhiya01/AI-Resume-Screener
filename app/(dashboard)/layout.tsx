import { Metadata } from 'next';
import React from 'react';

import { Navbar } from '@/components/shared/layout/navbar';
import { Sidebar } from '@/components/shared/layout/sidebar';

export const metadata: Metadata = {
  title: 'Dashboard - Indigo Insight',
  description: 'AI-powered resume screening and candidate matching platform',
};

const AppLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Navbar />

        {/* Content Area */}
        <section className="container mx-auto flex flex-1 flex-col">
          {children}
        </section>
      </div>
    </main>
  );
};

export default AppLayout;
