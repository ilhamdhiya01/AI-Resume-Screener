import React from 'react';

import { Button, Icon } from '@/components/ui';

import Score from './Score';

const DocumentItem = React.memo(() => {
  return (
    <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Checkbox */}
      <input
        type="checkbox"
        className="accent-primary-600 size-4 shrink-0 cursor-pointer rounded border-slate-300"
      />

      {/* File info */}
      <div className="flex flex-1 items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50">
          <Icon icon="TbPdf" className="text-red-500" size={22} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-base font-bold text-slate-700">
            John Doe - Software Engineer
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Icon icon="TbCalendar" size={16} />
              Oct 24, 2026
            </span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span>2:30 PM</span>
          </div>
        </div>
      </div>

      {/* Score */}
      <Score score={92} />

      {/* Divider */}
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-px bg-slate-200" />
      </div>

      {/* Status */}
      <span className="border-secondary-200 bg-secondary-50 text-secondary-600 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold tracking-wide uppercase">
        <span className="bg-secondary-600 size-2 rounded-full" />
        Completed
      </span>

      {/* Divider */}
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-px bg-slate-200" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          label="View Result"
          variant="ghost"
          color="primary"
          className="bg-primary-100"
        />
        <Button iconButton="TbDownload" variant="ghost" color="neutral" />
        <Button iconButton="TbTrash" variant="ghost" color="neutral" />
      </div>
    </div>
  );
});

DocumentItem.displayName = 'DocumentItem';

export default DocumentItem;
