import { History } from '@/components/features/history';

interface HistoryPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
  }>;
}

const HistoryPage = async ({ searchParams }: HistoryPageProps) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';

  return (
    <History.Layout params={{ tab: params.tab, page, search }}>
      <History.DocumentList page={page} status={params.tab} search={search} />
    </History.Layout>
  );
};

export default HistoryPage;
