import DashboardDataView from './DashboardDataView';
import Header from './Header';

const Layout = () => (
  <section className="flex flex-col gap-6 p-8">
    <Header />
    <DashboardDataView />
  </section>
);

export default Layout;
