'use client';

import React, { useState } from 'react';

import { Tab } from '@/components/shared/tab';
import { Button, DatePicker } from '@/components/ui';

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
  const [rangeDate, setRangeDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

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
