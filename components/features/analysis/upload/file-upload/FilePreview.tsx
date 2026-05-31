import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { formatFileSize, getRelativeTime } from '@/lib/helpers';
import { useAnalysisStore } from '@/lib/stores/global/useAnalysisStore';

interface FilePreviewProps {
  open: () => void;
}

const FilePreview = ({ open }: FilePreviewProps) => {
  const { file, isDragActive, uploadTime, clearFile, fileRejections } =
    useAnalysisStore();

  const [, setTick] = useState(0);

  // Auto-update every 1 minute
  useEffect(() => {
    if (!uploadTime) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1); // Force re-render
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval); // Cleanup saat unmount
  }, [uploadTime]);

  const fileIcon = useMemo(() => {
    if (fileRejections.length > 0) {
      return 'TbFileX';
    }

    return 'TbFileDescription';
  }, [fileRejections]);

  return (
    <>
      {file ? (
        <>
          <div
            className={classNames(
              'relative flex h-24 w-18',
              'items-center justify-center rounded-xl border',
              'transition-transform duration-600',
              'group-hover:scale-105',
              {
                'border-red-300 bg-red-100 text-red-600':
                  fileRejections.length > 0,
                'bg-secondary-100 border-secondary-300 text-secondary-600/60':
                  fileRejections.length === 0,
              }
            )}
          >
            <Icon icon={fileIcon} size={40} />
            <div
              className={classNames(
                'absolute -right-2 -bottom-2',
                'flex size-7 items-center justify-center',
                'rounded-full bg-white drop-shadow-lg',
                'transition-transform duration-300'
              )}
            >
              <div
                className={classNames(
                  'flex size-6 items-center justify-center rounded-full',
                  {
                    'bg-green-500': fileRejections.length === 0,
                    'bg-red-500': fileRejections.length > 0,
                  }
                )}
              >
                <Icon
                  icon={fileRejections.length === 0 ? 'TbCheck' : 'TbX'}
                  className="shrink-0 text-white transition-transform duration-300 group-hover:rotate-15"
                  size={17}
                />
              </div>
            </div>
            {fileRejections.length === 0 && (
              <span className="bg-primary-600 absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {file?.type === 'application/pdf' ? 'PDF' : 'DOCX'}
              </span>
            )}
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">{file?.name}</h2>
            <div className="flex justify-center gap-3">
              <span className="bg-secondary-100 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm">
                <Image
                  src="/icons/SizeIcon.svg"
                  alt="size"
                  width={14}
                  height={14}
                />
                {formatFileSize(file?.size || 0)}
              </span>
              <span className="bg-secondary-100 text-pi inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm">
                <Icon icon="TbClock" size={16} />
                Uploaded {uploadTime ? getRelativeTime(uploadTime) : 'just now'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              color="danger"
              variant="ghost"
              preffixIcon="TbTrash"
              label="Remove"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            />
            <Button
              size="sm"
              color="primary"
              variant="ghost"
              preffixIcon="TbRefresh"
              label="Change File"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            />
          </div>
        </>
      ) : (
        <>
          <div
            className={classNames(
              'relative flex size-20 items-center justify-center',
              'border-primary-500 bg-primary-600 rounded-2xl border',
              'transition-transform duration-600',
              'group-hover:scale-105',
              {
                'scale-105': isDragActive,
              }
            )}
          >
            <Icon
              icon="TbFileUpload"
              className="text-primary-100 stroke-2"
              size={40}
            />

            <div
              className={classNames(
                'absolute -right-2 -bottom-2',
                'flex size-7 items-center justify-center',
                'rounded-full bg-white shadow-lg',
                'transition-transform duration-300',
                {
                  'rotate-15': isDragActive,
                }
              )}
            >
              <Icon
                icon="TbPlus"
                className="text-primary-700 transition-transform duration-300 group-hover:rotate-15"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Drag & Drop Resume</h2>
            <p className="text-neutral-700">
              or{' '}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="text-primary-700 cursor-pointer underline"
              >
                browse files
              </span>{' '}
              from your computer
            </p>
            <p className="text-neutral-500">Supported : PDF, DOCX (Max 10MB)</p>
          </div>
        </>
      )}
    </>
  );
};

export default FilePreview;
