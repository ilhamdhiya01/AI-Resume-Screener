import Image from 'next/image';

import Button from '@/components/ui/button';

const Footer = () => {
  return (
    <div className="shrink-0 space-y-3 border-t border-slate-300 p-4">
      <Button preffixIcon="TbFileUpload" label="Upload Resume" fullWidth />
      <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white p-4">
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
            Ilham Dhiya Ulhaq
          </span>
          <small className="text-xs text-neutral-500">Premium Member</small>
        </div>
      </div>
    </div>
  );
};

export default Footer;
