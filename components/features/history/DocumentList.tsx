'use client';

import React from 'react';

import { useHistory } from '@/lib/hooks/history/useHistory';

import DocumentItem from './DocumentItem';

interface DocumentListProps {
  page: number;
  status?: string;
}

const DocumentList = React.memo<DocumentListProps>(({ page, status }) => {
  const { data, isPending, isError } = useHistory(page, status);

  if (isPending) return <div>Loading history...</div>;
  if (isError) return <div>Failed to load history</div>;

  const items = data?.data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        No resume history found.
      </div>
    );
  }

  return (
    <div className="mt-6 max-h-[calc(100vh-420px)] space-y-4 overflow-y-auto">
      {items.map((item) => (
        <DocumentItem
          key={item.id}
          status={item.status}
          score={item.analysis?.score ?? 0}
          fileName={item.fileName}
          date={new Date(item.createdAt).toLocaleDateString()}
          time={new Date(item.createdAt).toLocaleTimeString()}
        />
      ))}
    </div>
  );
});

DocumentList.displayName = 'DocumentList';

export default DocumentList;
