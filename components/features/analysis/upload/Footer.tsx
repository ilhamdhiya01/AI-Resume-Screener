'use client';

import classNames from 'classnames';
import React from 'react';
import { TbArrowRight } from 'react-icons/tb';
import { useShallow } from 'zustand/shallow';

import Icon from '@/components/ui/icon';
import { useUploadResume } from '@/lib/hooks/upload/useUpload';
import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

const Footer = React.memo(() => {
  const { fileRejections, file, jobDescription } = useAnalysisStore(
    useShallow((state) => ({
      fileRejections: state.fileRejections,
      file: state.file,
      jobDescription: state.jobDescription,
    }))
  );
  const { uploadResume, isUploading } = useUploadResume();

  // Check if button should be disabled
  const isDisabled = fileRejections.length > 0 || !file;

  const onClik = async () => {
    if (!file) return;
    const payload = { file, jobDescription };
    uploadResume(payload);
  };

  return (
    <>
      <button
        onClick={onClik}
        disabled={isDisabled || isUploading}
        className={classNames(
          'group relative overflow-hidden rounded-xl px-8 py-4 text-white shadow-lg transition-all duration-300',
          {
            'bg-primary-600 hover:bg-primary-700 cursor-pointer':
              !isDisabled && !isUploading,
            'bg-primary-700/30 cursor-not-allowed': isDisabled || isUploading,
          }
        )}
      >
        {/* Efek Berkilau - cuma muncul kalo nggak disabled */}
        {!isDisabled && !isUploading && (
          <>
            <div className="pointer-events-none absolute inset-0 h-full w-full transform bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-600 ease-out group-hover:opacity-100" />
            <div className="group-hover:animate-shimmer pointer-events-none absolute top-0 -left-[75%] h-full w-[80%] bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </>
        )}

        <div className="relative flex items-center justify-center gap-3">
          <span className="text-lg font-bold">Start Analysis</span>
          <TbArrowRight
            className={classNames(
              'text-2xl transition-transform duration-300',
              {
                'group-hover:translate-x-1.5': !isDisabled && !isUploading,
              }
            )}
          />
        </div>
      </button>

      <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2">
        <Icon
          icon="LuShieldCheck"
          className="text-primary-700 shrink-0 stroke-3"
          size={18}
        />
        <span className="text-neutral-600">
          Secure, end-to-end encrypted document processing
        </span>
      </div>
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;
