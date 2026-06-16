'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useMemo, useState } from 'react';

import TabItem from './TabItem';

export interface TabItemData {
  slug: string;
  label: string;
}

interface TabProps {
  items: TabItemData[];
}

const Tab = React.memo<TabProps>(({ items }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab || 'all';
  }, [searchParams]);

  const [selectedTab, setSelectedTab] = useState<string>(activeTab);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setSelectedTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabId);
      router.replace(`/history?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <Suspense>
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
    </Suspense>
  );
});

Tab.displayName = 'Tab';

export default Tab;
