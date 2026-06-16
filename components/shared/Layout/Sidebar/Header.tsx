import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { ROOT_PATH } from '@/routes';

const Header = React.memo(() => {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-slate-300 px-4">
      <Link href={ROOT_PATH} className="inline-flex items-center gap-2">
        <Image src="/icons/Logo.svg" alt="Logo" width={24} height={24} />
        <h1 className="text-primary-800 text-xl leading-none font-extrabold">
          Indigo Insight
        </h1>
      </Link>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
