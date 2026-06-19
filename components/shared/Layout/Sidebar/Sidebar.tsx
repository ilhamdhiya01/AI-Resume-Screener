import React from 'react';

import { SIDEBAR_NAVIGATION } from '@/const/navigation';

import Footer from './Footer';
import Header from './Header';
import MenuItem from './MenuItem';

const SidebarRoot = React.memo(() => {
  return (
    <aside className="flex h-screen w-1/5 max-w-1/5 flex-col border-r border-slate-300 bg-[#f7fafc]">
      <Header />
      <nav
        className="mt-1 flex flex-1 flex-col space-y-1 overflow-hidden overflow-y-auto p-2"
        aria-label="Main Navigation"
      >
        {SIDEBAR_NAVIGATION.map((item) => (
          <MenuItem key={item.path} {...item} />
        ))}
      </nav>
      <Footer />
    </aside>
  );
});

SidebarRoot.displayName = 'SidebarRoot';

export default SidebarRoot;
