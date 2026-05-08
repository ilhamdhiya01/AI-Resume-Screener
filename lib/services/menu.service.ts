import prisma from '../db';

export const getMenuItems = async () => {
  const menuItems = await prisma.menu.findMany();
  return menuItems;
};
