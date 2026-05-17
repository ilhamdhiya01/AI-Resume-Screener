import { SIDEBAR_NAVIGATION } from '@/const/navigation';

import { Sidebar } from '.';

const SidebarRoot = () => {
  return (
    <aside className="flex h-screen w-1/5 max-w-1/5 flex-col border-r border-slate-300 bg-[#f7fafc]">
      <Sidebar.Header />
      <nav
        className="mt-1 flex flex-1 flex-col space-y-1 overflow-hidden overflow-y-auto p-2"
        aria-label="Main Navigation"
      >
        {SIDEBAR_NAVIGATION.map((item) => (
          <Sidebar.Item key={item.path} {...item} />
        ))}
      </nav>
      <Sidebar.Footer />
    </aside>
  );
};

export default SidebarRoot;
