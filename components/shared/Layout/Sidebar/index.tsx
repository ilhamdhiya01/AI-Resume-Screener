import Footer from './Footer';
import Header from './Header';
import MenuItem from './MenuItem';
import SidebarRoot from './Sidebar';

export const Sidebar = Object.assign(SidebarRoot, {
  Header,
  Item: MenuItem,
  Footer,
});
