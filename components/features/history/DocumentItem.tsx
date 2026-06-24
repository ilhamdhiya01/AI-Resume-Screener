import classNames from 'classnames';
import React from 'react';

import { UploadStatus } from '@/app/generated/prisma/enums';
import { Button, Icon, Input } from '@/components/ui';
import useDownloadResume from '@/lib/hooks/history/useDownload';
import useItemJobProgress from '@/lib/hooks/history/useItemJobProgress';

import Score from './Score';

interface DocumentItemActionsProps {
  onViewResult?: (id: string) => void;
  onRemove?: (id: string) => void;
}

interface DocumentItemProps extends DocumentItemActionsProps {
  status: UploadStatus;
  score: number;
  fileName: string;
  filePath: string;
  date: string;
  time: string;
  id: string;
}

const DocumentItem = React.memo<DocumentItemProps>(
  ({
    status,
    score,
    fileName,
    filePath,
    date,
    time,
    id,
    onViewResult,
    onRemove,
  }) => {
    const { handleDownload, isDownloading } = useDownloadResume();
    const { progress } = useItemJobProgress(id, status);
    const isDocx = (fileName || '')
      .toLowerCase()
      .split('?')[0]
      .endsWith('.docx');

    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';
    const showProgress = !isCompleted && !isFailed;
    return (
      <div className="relative flex items-center gap-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
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
          <div className="flex min-w-0 flex-1 flex-col gap-1">
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

        <div className="flex w-20 shrink-0 items-center justify-center">
          <Score score={score} />
        </div>

        <div className="h-10 w-px shrink-0 bg-slate-200" />

        <div className="flex w-32 shrink-0 items-center justify-center">
          <span
            className={classNames(
              'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold tracking-wide uppercase',
              {
                'border-secondary-200 bg-secondary-50 text-secondary-600':
                  status === 'COMPLETED',
                'border-tertiary-200 bg-tertiary-50 text-tertiary-600':
                  status === 'PROCESSING' || status === 'PENDING',
                'border-red-200 bg-red-50 text-red-600': status === 'FAILED',
              }
            )}
          >
            <span
              className={classNames('size-2 rounded-full', {
                'bg-secondary-600': status === 'COMPLETED',
                'bg-tertiary-600':
                  status === 'PROCESSING' || status === 'PENDING',
                'bg-red-600': status === 'FAILED',
              })}
            />
            {status}
          </span>
        </div>

        <div className="h-10 w-px shrink-0 bg-slate-200" />

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            label={status === 'COMPLETED' ? 'View Result' : 'View Details'}
            color="secondary"
            onClick={() => onViewResult?.(id)}
          />
          <Button
            type="button"
            iconButton="TbDownload"
            variant="ghost"
            color="neutral"
            disabled={!isCompleted}
            isLoading={isDownloading}
            onClick={() => handleDownload({ filePath, fileName })}
          />
          <Button
            type="button"
            iconButton="TbTrash"
            variant="ghost"
            color="neutral"
            disabled={!isCompleted}
            onClick={() => onRemove?.(id)}
          />
        </div>
        {showProgress && (
          <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="bg-primary-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }
);

DocumentItem.displayName = 'DocumentItem';

export default DocumentItem;
