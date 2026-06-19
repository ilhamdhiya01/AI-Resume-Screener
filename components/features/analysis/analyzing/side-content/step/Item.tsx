import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/button';
import Icon, { IconProps } from '@/components/ui/icon';
import { ANALYSIS_PATH } from '@/routes';

import ProgressBar from './ProgressBar';

interface ItemProps {
  isLast: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  title: string;
  description: string;
  stepIndex: number;
  duration?: number;
}

const Item = React.memo<ItemProps>(
  ({
    isLast,
    isActive,
    isCompleted,
    isError = false,
    errorMessage,
    onRetry,
    title,
    description,
    stepIndex,
    duration,
  }) => {
    const isPending = !isActive && !isCompleted && !isError;
    const [elapsedTime, setElapsedTime] = useState(0);
    const router = useRouter();

    // Durasi NYATA hasil pengukuran backend (ms) untuk step ini.
    const finalMs = duration ?? 0;

    const icon: IconProps['icon'] = useMemo(() => {
      if (isError) return 'TbX';
      if (isActive) return 'FiActivity';
      if (isCompleted) return 'TbCheck';

      return `TbNumber${stepIndex + 1}` as IconProps['icon'];
    }, [isError, isActive, isCompleted, stepIndex]);

    // Bar fill saat step aktif. Durasi total nggak diketahui di awal,
    // jadi pakai easing asimptotik biar bar tetap gerak (mendekati 95%)
    // dan baru penuh (100%) ketika step selesai.
    const progressPercentage = useMemo(() => {
      if (isCompleted) return 100;
      if (!isActive) return 0;
      return Math.min(95, 100 * (1 - Math.exp(-elapsedTime / 4000)));
    }, [elapsedTime, isActive, isCompleted]);

    // Timer durasi yang ditampilkan: live saat aktif, freeze di durasi
    // nyata dari backend saat selesai.
    const displayMs = isCompleted ? finalMs : elapsedTime;
    const displaySeconds = (displayMs / 1000).toFixed(1);

    // ✅ Track elapsed time real-time selama step aktif
    useEffect(() => {
      if (!isActive) {
        setElapsedTime(0);
        return;
      }

      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 100); // tick tiap 100ms
      }, 100);

      return () => clearInterval(interval);
    }, [isActive]);

    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className={classNames(
              'flex size-10 items-center justify-center rounded-full transition-all duration-300',
              {
                'bg-secondary-700': isCompleted,
                'bg-primary-700': isActive,
                'bg-red-600': isError,
                'border border-slate-300': isPending,
              }
            )}
          >
            <Icon
              icon={icon}
              className={classNames('shrink-0 stroke-3', {
                'animate-pulse text-white': isActive,
                'text-white': isCompleted || isError,
                'text-slate-400': isPending,
              })}
              size={20}
            />
          </div>
          {!isLast && (
            <div
              className={classNames('min-h-20 w-0.5 flex-1', {
                'bg-red-300': isError,
                'bg-slate-300': !isError,
              })}
            />
          )}
        </div>
        <div className="space-y-3">
          <span
            className={classNames(
              'text-lg font-bold transition-colors duration-300',
              {
                'text-primary-700': isActive,
              }
            )}
          >
            {title}
          </span>
          <p
            className={classNames('text-sm transition-colors duration-300', {
              'text-primary-700': isActive,
            })}
          >
            {description}
          </p>
          {isError && (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <div className="flex items-start gap-2">
                <Icon
                  icon="TbAlertTriangle"
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <p className="text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              </div>
              {onRetry && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="danger"
                    variant="outlined"
                    preffixIcon="TbRefresh"
                    label="Retry"
                    onClick={onRetry}
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="outlined"
                    preffixIcon="TbFileUpload"
                    label="Upload Resume"
                    onClick={() => router.replace(ANALYSIS_PATH)}
                  />
                </div>
              )}
            </div>
          )}
          {(isActive || isCompleted) && (
            <div className="space-y-1">
              {isActive && <ProgressBar progress={progressPercentage} />}
              <span className="text-xs font-medium text-slate-500">
                {displaySeconds}s
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Item.displayName = 'StepItem';

export default Item;
