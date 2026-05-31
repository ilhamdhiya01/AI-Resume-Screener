/* eslint-disable react-hooks/set-state-in-effect */
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';

import Icon, { IconProps } from '@/components/ui/icon';

import ProgressBar from './ProgressBar';

interface ItemProps {
  isLast: boolean;
  isActive: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
  stepIndex: number;
  stepKey: string;
  durations: Record<string, number>;
}

const Item = ({
  isLast,
  isActive,
  isCompleted,
  title,
  description,
  stepIndex,
  stepKey,
  durations,
}: ItemProps) => {
  const isPending = !isActive && !isCompleted;
  const [elapsedTime, setElapsedTime] = useState(0);

  // Durasi NYATA hasil pengukuran backend (ms) untuk step ini.
  const finalMs = durations[stepKey] ?? 0;

  const icon: IconProps['icon'] = useMemo(() => {
    if (isActive) return 'FiActivity';
    if (isCompleted) return 'TbCheck';

    return `TbNumber${stepIndex + 1}` as IconProps['icon'];
  }, [isActive, isCompleted, stepIndex]);

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
              'border border-slate-300': isPending,
            }
          )}
        >
          <Icon
            icon={icon}
            className={classNames('shrink-0 stroke-3', {
              'animate-pulse text-white': isActive,
              'text-white': isCompleted,
              'text-slate-400': isPending,
            })}
            size={20}
          />
        </div>
        {!isLast && <div className="h-20 w-0.5 bg-slate-300" />}
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
};

export default Item;
