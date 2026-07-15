'use client';

import { format, parse } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';

import { RoleGuard } from '@/components/shared/role-guard';
import { Tab } from '@/components/shared/tab';
import Button from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import Input from '@/components/ui/input';
import useExportCSV from '@/lib/hooks/history/useExportCSV';
import useDebounce from '@/lib/hooks/useDebounce';
import { HISTORY_PATH } from '@/routes';

import Header from './Header';

const formatISODate = (date: Date | null): string =>
  date ? format(date, 'yyyy-MM-dd') : '';

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
  params: {
    tab?: string;
    page?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}) => {
  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const router = useRouter();
  const { handleExport, isExporting } = useExportCSV();
  const session = useSession();

  const [rangeDate, setRangeDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: params.dateFrom
      ? parse(params.dateFrom, 'yyyy-MM-dd', new Date())
      : null,
    to: params.dateTo ? parse(params.dateTo, 'yyyy-MM-dd', new Date()) : null,
  });

  const buildUrlParams = useCallback(
    (overrides: Record<string, string>) => {
      const urlParams = new URLSearchParams();
      if (params.tab) urlParams.set('tab', params.tab);
      urlParams.set('page', '1');

      const currentSearch = debouncedSearch.trim();
      if (currentSearch) urlParams.set('search', currentSearch);

      const from = formatISODate(rangeDate.from);
      const to = formatISODate(rangeDate.to);
      if (from) urlParams.set('dateFrom', from);
      if (to) urlParams.set('dateTo', to);

      Object.entries(overrides).forEach(([key, value]) => {
        if (value) urlParams.set(key, value);
        else urlParams.delete(key);
      });

      return urlParams;
    },
    [debouncedSearch, rangeDate.from, rangeDate.to, params.tab]
  );

  useEffect(() => {
    const currentSearch = debouncedSearch.trim();
    const paramsSearch = (params.search || '').trim();
    const from = formatISODate(rangeDate.from);
    const to = formatISODate(rangeDate.to);
    const paramsFrom = params.dateFrom || '';
    const paramsTo = params.dateTo || '';

    if (
      currentSearch === paramsSearch &&
      from === paramsFrom &&
      to === paramsTo
    ) {
      return;
    }

    const urlParams = buildUrlParams({});
    router.push(`${HISTORY_PATH}?${urlParams.toString()}`, { scroll: false });
  }, [
    debouncedSearch,
    rangeDate.from,
    rangeDate.to,
    params.search,
    params.dateFrom,
    params.dateTo,
    router,
    buildUrlParams,
  ]);

  const handleExportClick = useCallback(() => {
    handleExport({
      status: params.tab,
      search: debouncedSearch,
      dateFrom: formatISODate(rangeDate.from),
      dateTo: formatISODate(rangeDate.to),
    });
  }, [handleExport, params.tab, debouncedSearch, rangeDate.from, rangeDate.to]);

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
        <RoleGuard role={session.data?.user?.role || 'FREE'} allow="ADMIN">
          <Button
            label="Export Report (CSV)"
            preffixIcon="TbDownload"
            variant="outlined"
            isLoading={isExporting}
            onClick={handleExportClick}
          />
        </RoleGuard>
      </div>

      {children}
    </section>
  );
};

export default Layout;
