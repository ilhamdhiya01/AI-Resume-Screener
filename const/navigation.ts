import { IconProps } from '@/components/ui/icon';
import { NavigationItem } from '@/lib/types/navigation.types';

export const SIDEBAR_NAVIGATION: (Omit<NavigationItem, 'icon'> & {
  icon: IconProps['icon'];
})[] = [
  {
    name: 'Dashboard',
    icon: 'FiGrid',
    path: '/',
    order: 0,
    isActive: true,
    role: ['ADMIN'],
  },
  {
    name: 'Analysis',
    icon: 'RiBarChartBoxLine',
    path: '/analysis',
    order: 1,
    isActive: true,
    role: ['ADMIN'],
  },
  {
    name: 'History',
    icon: 'TbHistory',
    path: '/history',
    order: 2,
    isActive: true,
    role: ['ADMIN'],
  },
  {
    name: 'Settings',
    icon: 'TbSettings',
    path: '/settings',
    order: 3,
    isActive: true,
    role: ['ADMIN'],
  },
] as const;
