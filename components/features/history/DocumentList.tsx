'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import Pagination from '@/components/shared/pagination/Pagination';
import { useHistory } from '@/lib/hooks/history/useHistory';
import { ANALYSIS_PATH, HISTORY_PATH } from '@/routes';

import DocumentItem from './DocumentItem';
import EmptyHistory from './EmptyHistory';
import ErrorHistory from './ErrorHistory';
import HistoryListSkeleton from './HistoryListSkeleton';

interface DocumentListProps {
  page: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

const DocumentList = React.memo<DocumentListProps>(
  ({ page, status, search, dateFrom, dateTo }) => {
    const { data, isPending, isError, refetch } = useHistory(
      page,
      status,
      search,
      dateFrom,
      dateTo
    );
    const router = useRouter();

    const handleViewResult = useCallback((resumeId: string) => {
      window.open(`${ANALYSIS_PATH}/${resumeId}`, '_blank');
    }, []);

    const handlePageChange = useCallback(
      (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', String(newPage));
        router.push(`${HISTORY_PATH}?${params.toString()}`, { scroll: false });
      },
      [router]
    );

    if (isPending) return <HistoryListSkeleton />;
    if (isError) return <ErrorHistory onRetry={refetch} />;

    const items = data?.data?.items ?? [];
    const totalPages = data?.data?.totalPages ?? 1;
    const totalItems = data?.data?.total ?? 0;
    const limit = data?.data?.limit ?? 10;

    if (items.length === 0) {
      return <EmptyHistory />;
    }

    return (
      <>
        <div className="relative max-h-[calc(100vh-350px)] space-y-4 overflow-y-auto">
          {items.map((item) => (
            <DocumentItem
              key={item.id}
              id={item.id}
              status={item.status}
              score={item.analysis?.score ?? 0}
              fileName={item.fileName}
              filePath={item.filePath}
              date={new Date(item.createdAt).toLocaleDateString()}
              time={new Date(item.createdAt).toLocaleTimeString()}
              onViewResult={handleViewResult}
            />
          ))}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          currentCount={items.length}
          onPageChange={handlePageChange}
        />
      </>
    );
  }
);

DocumentList.displayName = 'DocumentList';

export default DocumentList;
