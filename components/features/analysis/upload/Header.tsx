'use client';

import { useMemo } from 'react';
import { ErrorCode } from 'react-dropzone';

import Icon from '@/components/ui/icon';
import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

const Header = () => {
  const { fileRejections, file } = useAnalysisStore();

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
  }, [fileRejections]);

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto flex size-12 h-16 w-16 items-center justify-center rounded-xl bg-white p-4 drop-shadow-sm">
        <Icon
          icon="TbSparkles"
          className="text-primary-700 shrink-0 animate-pulse"
          size={33}
        />
      </div>
      <h1 className="text-4xl font-extrabold">{headerMessage?.title}</h1>
      <p className="max-w-xl text-neutral-700">{headerMessage?.message}</p>
    </div>
  );
};

export default Header;
