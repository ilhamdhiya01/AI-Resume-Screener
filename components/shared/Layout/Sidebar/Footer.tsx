'use client';

import { startCase } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import Button from '@/components/ui/button';
import { ANALYSIS_PATH, LOGIN_PATH } from '@/routes';

const Footer = () => {
  const router = useRouter();

  const session = useSession();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });
    router.replace(LOGIN_PATH);
  };
  return (
    <div className="shrink-0 space-y-3 border-t border-slate-300 p-4">
      <Button
        preffixIcon="TbFileUpload"
        label="Upload Resume"
        fullWidth
        onClick={() => {
          router.replace(ANALYSIS_PATH);
        }}
      />
      <div className="space-y-2 rounded-md border border-slate-300 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <Image
              src="/icons/Logo.svg"
              alt="Logo"
              className="rounded-full object-cover"
              width={26}
              height={26}
            />
            <span className="absolute -right-[2px] -bottom-[2px] z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {session.data?.user?.name}
            </span>
            <small className="text-xs text-neutral-500">
              {startCase(session.data?.user?.role?.toLowerCase())}
            </small>
          </div>
        </div>
        <Button
          preffixIcon="TbLogout"
          label="Log Out"
          size="sm"
          fullWidth
          variant="outlined"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Footer;
