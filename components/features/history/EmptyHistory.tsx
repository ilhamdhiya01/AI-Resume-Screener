'use client';

import React from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ANALYSIS_PATH } from '@/routes';

const EmptyHistory = () => (
  <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-blue-100">
      <Icon icon="TbFileSearch" size={32} className="text-blue-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700">
      No resume history yet
    </h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      Upload your first resume to start screening candidates and see the results
      here.
    </p>
    <Button
      type="button"
      label="Upload Resume"
      color="primary"
      link={ANALYSIS_PATH}
      className="mt-6"
    />
  </div>
);

export default EmptyHistory;
