'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

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
      router.replace(`/history?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="my-6 flex w-full gap-8 border-b border-b-slate-300">
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
