'use client';

import React from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ErrorHistoryProps {
  onRetry: () => void;
}

const ErrorHistory = ({ onRetry }: ErrorHistoryProps) => (
  <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-100">
      <Icon icon="TbAlertTriangle" size={32} className="text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700">
      Failed to load history
    </h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      We couldn&apos;t fetch your resume history. Please try again.
    </p>
    <Button
      type="button"
      label="Try Again"
      color="primary"
      onClick={onRetry}
      className="mt-6"
    />
  </div>
);

export default ErrorHistory;
