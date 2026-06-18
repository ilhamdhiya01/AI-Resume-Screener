'use client';

import React, { useState } from 'react';

import Tab from '@/components/shared/tab/Tab';
import { Button, DatePicker } from '@/components/ui';
import { Select } from '@/components/ui';

import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [selectValue, setSelectValue] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [rangeDate, setRangeDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  return (
    <section className="flex flex-col p-8">
      <Header />
      <Tab
        items={[
          { slug: 'all', label: 'All Work' },
          { slug: 'completed', label: 'Completed' },
          { slug: 'processing', label: 'Processing' },
          { slug: 'failed', label: 'Failed' },
        ]}
      />

      {/* Preview: Select + DatePicker */}
      <div className="mb-4 flex justify-between">
        <div className="flex gap-4">
          <Select
            placeholder="Choose status..."
            value={selectValue}
            onChange={(option) =>
              setSelectValue(option as { value: string; label: string })
            }
            options={[
              { value: 'all', label: 'All Work' },
              { value: 'completed', label: 'Completed' },
              { value: 'processing', label: 'Processing' },
              { value: 'failed', label: 'Failed' },
            ]}
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
