'use client';

import { useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { useShallow } from 'zustand/shallow';

import { useAnalysisStore } from '../../stores/global/useAnalysisStore';

const useGlobalDropZone = () => {
  const {
    setFile,
    setUploadTime,
    setFileRejections,
    setIsDragReject,
    setIsDragActive,
    fileRejections,
  } = useAnalysisStore(
    useShallow((state) => ({
      setFile: state.setFile,
      setUploadTime: state.setUploadTime,
      setFileRejections: state.setFileRejections,
      setIsDragReject: state.setIsDragReject,
      setIsDragActive: state.setIsDragActive,
      fileRejections: state.fileRejections,
    }))
  );

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

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    open,
  };
};

export default useGlobalDropZone;
