'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Tab } from '@/components/shared/tab';
import { Button, DatePicker, Input } from '@/components/ui';
import useDebounce from '@/lib/hooks/useDebounce';
import { HISTORY_PATH } from '@/routes';

import Header from './Header';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Work' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
] as const;

const Layout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tab?: string; page?: number; search?: string };
}) => {
  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const router = useRouter();

  const [rangeDate, setRangeDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  useEffect(() => {
    const currentSearch = debouncedSearch.trim();
    const paramsSearch = (params.search || '').trim();

    if (currentSearch === paramsSearch) return;

    const urlParams = new URLSearchParams();
    if (params.tab) urlParams.set('tab', params.tab);
    urlParams.set('page', '1');
    if (currentSearch) urlParams.set('search', currentSearch);

    router.push(`${HISTORY_PATH}?${urlParams.toString()}`, { scroll: false });
  }, [debouncedSearch, params.search, params.tab, router]);

  return (
    <section className="flex flex-col p-8">
      <Header />
      <Tab
        searchParams={params}
        items={STATUS_OPTIONS.map((opt) => ({
          slug: opt.value,
          label: opt.label,
        }))}
      />

      <div className="mb-4 flex justify-between">
        <div className="flex w-full gap-4">
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-[300px]"
          />
          <DatePicker
            mode="range"
            value={rangeDate}
            onChange={setRangeDate}
            placeholder="Pick a range..."
          />
        </div>
        <Button
          label="Export Report (CSV)"
          preffixIcon="TbDownload"
          variant="outlined"
        />
      </div>

      {children}
    </section>
  );
};

export default Layout;
