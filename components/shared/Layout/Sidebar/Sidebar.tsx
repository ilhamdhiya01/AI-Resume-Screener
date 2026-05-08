import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { SIDEBAR_NAVIGATION } from '@/const/navigation';

import MenuItem from './MenuItem';

const Sidebar = () => {
  return (
    <aside className="h-screen w-1/5 border-r border-r-neutral-200 bg-white">
      <nav className="flex h-full flex-col" aria-label="Sidebar Navigation">
        {/* 1. Header Sidebar / Logo */}
        <div className="inline-flex gap-2 px-4 py-5">
          <Image src="/icons/Logo.svg" alt="Logo" width={30} height={30} />
          <div className="flex flex-col gap-1">
            <h1 className="text-primary-800 text-2xl leading-none font-extrabold">
              Indigo Insight
            </h1>
            <span className="text-xs leading-none text-slate-600">
              AI Resume Analyzer
            </span>
          </div>
        </div>

        <div className="p-4">
          <Button preffixIcon="TbFileUpload" label="Upload Resume" fullWidth>
            Start Analysis
          </Button>
        </div>

        <nav className="py-4">
          <ul className="flex-1 space-y-1">
            {SIDEBAR_NAVIGATION.map((item) => (
              <MenuItem key={item.path} {...item} />
            ))}
          </ul>
        </nav>

        {/* 2. Menu Navigasi Utama */}
        {/* <ul className="flex-1 space-y-1">
          <li>
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-blue-700"
            >
           
              <span className="font-medium">Dashboard</span>
            </a>
          </li>
        </ul> */}

        {/* 3. Footer Sidebar (Profile/Settings) */}
        {/* <div className="">
          <button className="flex w-full items-center gap-3 px-2 py-2 hover:bg-slate-100">
            <div className="h-8 w-8 rounded-full bg-slate-300" />
            <span className="text-sm font-medium text-slate-700">
              User Profile
            </span>
          </button>
        </div> */}
      </nav>
    </aside>
  );
};

export default Sidebar;
