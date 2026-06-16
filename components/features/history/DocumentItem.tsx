import React from 'react';

import { Icon } from '@/components/ui';

import Score from './Score';

const DocumentItem = React.memo(() => {
  return (
    <div className="inline-flex items-center gap-12 rounded-lg border border-slate-300 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg border border-red-300 bg-red-50">
          <Icon icon="TbPdf" className="text-red-500" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-slate-600">
            John Doe - Software Engineer
          </p>
          <div className="flex items-center justify-baseline gap-2">
            <div className="inline-flex items-center gap-1 text-slate-400">
              <Icon icon="TbCalendar" size={20} />
              <p className="leading-0">Oct 24, 2026</p>
            </div>
            <p className="text-slate-400">2:30 PM</p>
          </div>
        </div>
      </div>
      <Score />
    </div>
  );
});

DocumentItem.displayName = 'DocumentItem';

export default DocumentItem;
