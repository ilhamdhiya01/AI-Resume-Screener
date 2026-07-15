'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { useShallow } from 'zustand/shallow';

import { ANALYSIS_PATH } from '@/routes';
import { useAnalysisStore } from '@/stores';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Hidden global file picker that can be triggered from anywhere in the app
 * via the `open` action stored in `useAnalysisStore`. After a file is selected,
 * the user is redirected to the analysis page with the file already set.
 */
const GlobalFileUpload = () => {
  const router = useRouter();
  const {
    setFile,
    setUploadTime,
    setFileRejections,
    setIsDragActive,
    setIsDragReject,
    setOpenFileDialog,
  } = useAnalysisStore(
    useShallow((state) => ({
      setFile: state.setFile,
      setUploadTime: state.setUploadTime,
      setFileRejections: state.setFileRejections,
      setIsDragActive: state.setIsDragActive,
      setIsDragReject: state.setIsDragReject,
      setOpenFileDialog: state.setOpenFileDialog,
    }))
  );

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadTime(new Date());
      setFileRejections([]);
      setIsDragActive(false);
      setIsDragReject(false);
    }
    router.push(ANALYSIS_PATH);
  };

  const onDropRejected = (rejections: FileRejection[]) => {
    const rejectedFile = rejections[0]?.file;
    setFileRejections(rejections);
    setFile(rejectedFile ?? null);
    router.push(ANALYSIS_PATH);
  };

  const { getInputProps, open } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx', '.doc'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: true,
    noDrag: true,
    noKeyboard: true,
    onDrop,
    onDropRejected,
  });

  useEffect(() => {
    setOpenFileDialog(open);
    return () => setOpenFileDialog(null);
  }, [open, setOpenFileDialog]);

  return <input {...getInputProps()} className="sr-only" />;
};

export default GlobalFileUpload;
