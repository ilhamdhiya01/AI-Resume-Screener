'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { TbArrowRight } from 'react-icons/tb';

import Icon from '@/components/ui/icon';
import { useUpload } from '@/lib/hooks';
import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

const Footer = () => {
  const { fileRejections, file, setFile, jobDescription, setJobDescription } =
    useAnalysisStore();
  const { uploadResume, isUploading } = useUpload();

  const router = useRouter();

  // ✅ Check apakah button harus disabled
  const isDisabled = useMemo(() => {
    // Disabled kalo ada error
    if (fileRejections.length > 0) return true;

    // Disabled kalo belum ada file
    if (!file) return true;

    return false;
  }, [fileRejections, file]);

  const onClik = async () => {
    if (!file) return;
    const result = await uploadResume(file, jobDescription);
    if (result) {
      router.push(`/analysis/${result.resumeId}`);
      setFile(null);
      setJobDescription('');
    }
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
};

export default Footer;
