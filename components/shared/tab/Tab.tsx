'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import { HISTORY_PATH } from '@/routes';

import TabItem from './TabItem';

export interface TabItemData {
  slug: string;
  label: string;
}

interface TabProps {
  searchParams: { tab?: string };
  items: TabItemData[];
}

const Tab = React.memo<TabProps>(({ searchParams, items }) => {
  const router = useRouter();

  const activeTab = useMemo(() => {
    return searchParams?.tab || 'all';
  }, [searchParams]);

  const [selectedTab, setSelectedTab] = useState<string>(activeTab);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setSelectedTab(tabId);
      const params = new URLSearchParams();
      params.set('tab', tabId);
      router.replace(`${HISTORY_PATH}?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="scrollbar-none my-6 flex w-full gap-4 overflow-x-auto border-b border-b-slate-300 whitespace-nowrap sm:gap-8">
      {items.map((item) => (
        <TabItem
          key={item.slug}
          {...item}
          isActive={selectedTab === item.slug}
          onClick={handleTabChange}
        />
      ))}
    </div>
  );
});

Tab.displayName = 'Tab';

export default Tab;
