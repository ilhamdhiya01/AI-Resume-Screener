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
    <main className="flex min-h-screen w-full">
      {/* Sidebar: Kasih lebar fix dan biarkan dia fixed/sticky */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="flex w-[70%] flex-1 flex-col">
        <Navbar />

        {/* Area Konten */}
        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
};

export default AppLayout;
