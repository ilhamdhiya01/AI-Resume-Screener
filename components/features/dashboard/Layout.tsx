import DashboardDataView from './DashboardDataView';
import Header from './Header';

const Layout = () => (
  <section className="flex flex-col gap-4 md:gap-6">
    <Header />
    <DashboardDataView />
  </section>
);

export default Layout;
