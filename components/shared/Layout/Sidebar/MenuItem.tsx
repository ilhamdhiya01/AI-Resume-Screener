'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import Icon, { IconProps } from '@/components/ui/icon';

interface MenuItemProps {
  path: string;
  icon: IconProps['icon'];
  name: string;
}

const MenuItem = ({ path, icon, name }: MenuItemProps) => {
  const pathName = usePathname();

  const isActive = useMemo(() => {
    return pathName && pathName === path;
  }, [pathName, path]);

  return (
    <Link
      key={path}
      href={path}
      className={classNames(
        'relative flex items-center gap-3 overflow-hidden rounded-md px-4 py-3 transition-colors duration-200',
        {
          'bg-blue-100 text-blue-700 before:absolute before:left-0 before:h-full before:w-1 before:bg-blue-700 before:content-[""]':
            isActive,
          'text-neutral-800 hover:bg-neutral-100': !isActive,
        }
      )}
    >
      <Icon icon={icon} size={18} />
      <span className="font-medium">{name}</span>
    </Link>
  );
};

export default MenuItem;
