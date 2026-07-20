'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { ErrorCode } from 'react-dropzone';
import { useShallow } from 'zustand/shallow';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAnalysisLimit } from '@/lib/hooks/analysis/useAnalysisLimit';
import { SETTINGS_PATH } from '@/routes';
import { useAnalysisStore } from '@/stores';

const Header = React.memo(() => {
  const router = useRouter();
  const { fileRejections, file } = useAnalysisStore(
    useShallow((state) => ({
      fileRejections: state.fileRejections,
      file: state.file,
    }))
  );
  const { credit, isPending: isCreditPending, canAnalyze } = useAnalysisLimit();
  const isLimitReached = !isCreditPending && !canAnalyze;

  const headerMessage: Record<string, string> = useMemo(() => {
    if (fileRejections.length === 0 && file) {
      return {
        title: 'File Ready for Analysis',
        message:
          'File selected. Click Start Analysis to proceed. The AI is ready to decode potential and extract key competencies.',
      };
    }

    if (fileRejections.length === 0) {
      return {
        title: 'Analyze Candidate Profile',
        message:
          'Let AI decode potential. Upload a resume to instantly extract key competencies and experience maps.',
      };
    }

    const allErrors = fileRejections[0]?.errors || [];

    const hasInvalidType = allErrors.some(
      (error) => error.code === ErrorCode['FileInvalidType']
    );
    const hasTooLarge = allErrors.some(
      (error) => error.code === ErrorCode['FileTooLarge']
    );

    if (hasInvalidType && hasTooLarge) {
      return {
        title: 'Multiple Issues Detected',
        message:
          'Your file has an unsupported format & exceeds the size limit. Please upload a PDF or DOCX file under 10MB.',
      };
    }

    switch (allErrors[0]?.code) {
      case ErrorCode['FileInvalidType']:
        return {
          title: 'Unsupported File Format',
          message:
            'Please upload your resume in PDF or DOCX format to proceed with the analysis.',
        };
      case ErrorCode['FileTooLarge']:
        return {
          title: 'File Too Large',
          message:
            'Your file exceeds the 10MB limit. Please compress or resize your document and try again.',
        };
      default:
        return {
          title: 'Upload Failed',
          message: allErrors[0]?.message || 'Something went wrong',
        };
    }
  }, [file, fileRejections]);

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto flex size-12 h-16 w-16 items-center justify-center rounded-xl bg-white p-4 drop-shadow-sm">
        <Icon
          icon="TbSparkles"
          className="text-primary-700 shrink-0 animate-pulse"
          size={33}
        />
      </div>
      <h1 className="text-2xl font-extrabold md:text-3xl lg:text-4xl">
        {headerMessage?.title}
      </h1>
      <p className="max-w-xl px-4 text-sm text-neutral-700 md:text-base lg:px-0">
        {headerMessage?.message}
      </p>

      {isLimitReached && credit && (
        <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-100 p-4 shadow-md sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-200 p-2 text-indigo-700">
              <Icon icon="TbLock" size={22} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-indigo-800">
                Usage Limit Reached
              </p>
              <p className="text-xs text-indigo-700">
                You&apos;ve used {credit.used} of {credit.limit} free analysis
                credits. Upgrade to Pro to continue.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="contained"
            label="Upgrade to Pro"
            suffixIcon="TbArrowRight"
            onClick={() => router.push(SETTINGS_PATH)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
          />
        </div>
      )}
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
