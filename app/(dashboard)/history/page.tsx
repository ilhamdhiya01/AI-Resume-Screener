import { History } from '@/components/features/history';

interface HistoryPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

const HistoryPage = async ({ searchParams }: HistoryPageProps) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const dateFrom = params.dateFrom || '';
  const dateTo = params.dateTo || '';

  return (
    <History.Layout
      params={{ tab: params.tab, page, search, dateFrom, dateTo }}
    >
      <History.DocumentList
        page={page}
        status={params.tab}
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </History.Layout>
  );
};

export default HistoryPage;
