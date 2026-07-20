import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Icon from '@/components/ui/icon';
import { ROOT_PATH } from '@/routes';

interface SidebarHeaderProps {
  onClose?: () => void;
}

const Header = React.memo(({ onClose }: SidebarHeaderProps) => {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-300 px-4">
      <Link href={ROOT_PATH} className="inline-flex items-center gap-2">
        <Image src="/icons/Logo.svg" alt="Logo" width={24} height={24} />
        <h1 className="text-primary-800 text-xl leading-none font-extrabold">
          Indigo Insight
        </h1>
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none lg:hidden"
        aria-label="Close navigation menu"
      >
        <Icon icon="TbX" size={20} />
      </button>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
