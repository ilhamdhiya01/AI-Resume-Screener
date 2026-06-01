'use client';

import classNames from 'classnames';

import useGlobalSropZone from '@/lib/hooks/useGlobalSropZone';

import FilePreview from './FilePreview';

const FileUpload = () => {
  const { fileRejections, getInputProps, getRootProps, isDragActive, open } =
    useGlobalSropZone();

  return (
    <section
      {...getRootProps()}
      className={classNames(
        'group card',
        'flex h-70 w-full flex-col items-center justify-center gap-4',
        'border-primary-200 rounded-2xl border-2 border-dashed',
        'bg-white transition-colors duration-300',
        {
          'border-primary-600 bg-primary-50': isDragActive,
          'border-red-200': fileRejections.length > 0 && !isDragActive,
        }
      )}
    >
      <input {...getInputProps()} />
      <FilePreview open={open} />
    </section>
  );
};

export default FileUpload;
