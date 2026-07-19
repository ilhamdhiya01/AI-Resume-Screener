import DashboardDataView from './DashboardDataView';
import Header from './Header';

const Layout = () => (
  <section className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:gap-6 lg:p-8">
    <Header />
    <DashboardDataView />
  </section>
);

export default Layout;
