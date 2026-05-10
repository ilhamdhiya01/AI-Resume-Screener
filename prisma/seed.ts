import type { Prisma } from '@/app/generated/prisma/client';
import { IconProps } from '@/components/ui/icon';
import prisma from '@/lib/db';

const Menus: (Omit<Prisma.MenuCreateInput, 'icon'> & {
  icon: IconProps['icon'];
})[] = [
  {
    name: 'Dashboard',
    icon: 'TbDashboard',
    path: '/dashboard',
    order: 0,
    isActive: true,
    role: ['ADMIN'],
  },
  {
    name: 'Analysis',
    icon: 'TbReport',
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
];

export const main = async () => {
  for (const menu of Menus) {
    await prisma.menu.create({
      data: menu,
    });
  }
};

main();
