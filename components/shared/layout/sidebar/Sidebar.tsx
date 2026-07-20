'use client';

import React from 'react';

import { SIDEBAR_NAVIGATION } from '@/const/navigation';

import Footer from './Footer';
import Header from './Header';
import MenuItem from './MenuItem';

interface SidebarRootProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarRoot = React.memo(({ isOpen, onClose }: SidebarRootProps) => {
  return (
    <>
      {/* Backdrop for mobile/tablet drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-slate-300 bg-[#f7fafc] transition-transform duration-300 ease-in-out',
          'lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:transition-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Main Navigation"
      >
        <Header onClose={onClose} />
        <nav className="mt-1 flex flex-1 flex-col space-y-1 overflow-hidden overflow-y-auto p-2">
          {SIDEBAR_NAVIGATION.map((item) => (
            <MenuItem key={item.path} {...item} />
          ))}
        </nav>
        <Footer />
      </aside>
    </>
  );
});

SidebarRoot.displayName = 'SidebarRoot';

export default SidebarRoot;
