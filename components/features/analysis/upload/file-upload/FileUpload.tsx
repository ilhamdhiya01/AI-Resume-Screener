'use client';

import classNames from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

import { useAnalysisStore } from '@/lib/stores/global/useAnalysisStore';

import FilePreview from './FilePreview';

const FileUpload = () => {
  const {
    setFile,
    setUploadTime,
    setFileRejections,
    setIsDragReject,
    setIsDragActive,
    fileRejections,
    setOpenFileDialog,
    open: openDialog,
    file,
  } = useAnalysisStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setUploadTime(new Date());
    setFileRejections([]);
    setIsDragActive(false);
    setIsDragReject(false);
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const rejectedFile = rejections[0]?.file;
    setFileRejections(rejections);
    setFile(rejectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx', '.doc'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: false,
    noKeyboard: true,
    onDrop,
    onDropRejected,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  useEffect(() => {
    setOpenFileDialog(open);

    return () => setOpenFileDialog(null);
  }, [setOpenFileDialog]);

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
