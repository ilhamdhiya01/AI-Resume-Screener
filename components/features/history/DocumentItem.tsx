import classNames from 'classnames';
import React from 'react';

import { UploadStatus } from '@/app/generated/prisma/enums';
import { Button, Icon, Input } from '@/components/ui';

import Score from './Score';

interface DocumentItemProps {
  status: UploadStatus;
  score: number;
  fileName: string;
  date: string;
  time: string;
}

const DocumentItem = React.memo<DocumentItemProps>(
  ({ status, score, fileName, date, time }) => {
    const isDocx = (fileName || '')
      .toLowerCase()
      .split('?')[0]
      .endsWith('.docx');
    return (
      <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <Input
          type="checkbox"
          className="size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-blue-600"
        />

        <div className="flex flex-1 items-center gap-4">
          <div
            className={classNames(
              'flex size-11 shrink-0 items-center justify-center rounded-lg border',
              {
                'border-blue-200 bg-blue-50': isDocx,
                'border-red-200 bg-red-50': !isDocx,
              }
            )}
          >
            <Icon
              icon={isDocx ? 'TbFileWord' : 'TbPdf'}
              className={classNames({
                'text-blue-500': isDocx,
                'text-red-500': !isDocx,
              })}
              size={22}
            />
          </div>
          <div className="flex max-w-[300px] min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-base font-bold text-slate-700">
              {fileName}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Icon icon="TbCalendar" size={16} />
                {date}
              </span>
              <span className="size-1 rounded-full bg-slate-300" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        <Score score={score} />

        <div className="flex max-w-40 flex-1 items-center justify-center">
          <div className="h-10 w-px bg-slate-200" />
        </div>

        <span
          className={classNames(
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold tracking-wide uppercase',
            {
              'border-secondary-200 bg-secondary-50 text-secondary-600':
                status === 'COMPLETED',
              'border-tertiary-200 bg-tertiary-50 text-tertiary-600':
                status === 'PROCESSING',
              'border-red-200 bg-red-50 text-red-600': status === 'FAILED',
            }
          )}
        >
          <span
            className={classNames('size-2 rounded-full', {
              'bg-secondary-600': status === 'COMPLETED',
              'bg-tertiary-600': status === 'PROCESSING',
              'bg-red-600': status === 'FAILED',
            })}
          />
          {status}
        </span>

        <div className="flex max-w-40 flex-1 items-center justify-center">
          <div className="h-10 w-px bg-slate-200" />
        </div>

        <div className="flex items-center gap-2">
          <Button label="View Result" color="secondary" />
          <Button iconButton="TbDownload" variant="ghost" color="neutral" />
          <Button iconButton="TbTrash" variant="ghost" color="neutral" />
        </div>
      </div>
    );
  }
);

DocumentItem.displayName = 'DocumentItem';

export default DocumentItem;
