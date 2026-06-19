'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import Tab from '@/components/shared/tab/Tab';
import { Button, DatePicker } from '@/components/ui';
import { Select } from '@/components/ui';

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
  params: { tab?: string; page?: number };
}) => {
  const router = useRouter();

  const currentTab = params.tab || 'all';
  const currentOption =
    STATUS_OPTIONS.find((opt) => opt.value === currentTab) || STATUS_OPTIONS[0];

  const [rangeDate, setRangeDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const handleStatusChange = useCallback(
    (option: { value: string; label: string } | null) => {
      if (!option) return;
      const searchParams = new URLSearchParams();
      searchParams.set('tab', option.value);
      router.replace(`/history?${searchParams.toString()}`, { scroll: false });
    },
    [router]
  );

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

      {/* Preview: Select + DatePicker */}
      <div className="mb-4 flex justify-between">
        <div className="flex gap-4">
          <Select
            placeholder="Choose status..."
            value={currentOption}
            onChange={handleStatusChange}
            options={[...STATUS_OPTIONS]}
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
