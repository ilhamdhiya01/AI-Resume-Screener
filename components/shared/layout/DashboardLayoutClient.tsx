'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import useDrawerState from '@/lib/hooks/useDrawerState';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

const ANALYSIS_RESULT_PATH_PATTERN = /^\/analysis\/[^/]+$/;

const DashboardLayoutClient = ({ children }: DashboardLayoutClientProps) => {
  const { isOpen, toggle, close } = useDrawerState();
  const pathname = usePathname();
  const isAnalysisResult = ANALYSIS_RESULT_PATH_PATTERN.test(pathname ?? '');

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={isOpen} onClose={close} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Navbar isMenuOpen={isOpen} onMenuToggle={toggle} />
        <section
          className={[
            'flex flex-1 flex-col',
            isAnalysisResult
              ? 'p-0'
              : 'px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8',
          ].join(' ')}
        >
          {children}
        </section>
      </div>
    </main>
  );
};

export default DashboardLayoutClient;
