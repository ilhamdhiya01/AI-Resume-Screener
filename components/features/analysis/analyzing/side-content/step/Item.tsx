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
  duration: number;
}

const Item = ({
  isLast,
  isActive,
  isCompleted,
  title,
  description,
  stepIndex,
  duration,
}: ItemProps) => {
  const isPending = !isActive && !isCompleted;
  const [elapsedTime, setElapsedTime] = useState(0);

  const icon: IconProps['icon'] = useMemo(() => {
    if (isActive) return 'FiActivity';
    if (isCompleted) return 'TbCheck';

    return `TbNumber${stepIndex + 1}` as IconProps['icon'];
  }, [isActive, isCompleted, stepIndex]);

  // ✅ Calculate progress percentage based on elapsed time
  const progressPercentage = useMemo(() => {
    if (!isActive || duration === 0) return 0;

    // Duration dari BE = duration per tick (misal: 250ms)
    // Total ticks untuk step ini sesuai dengan gradualProgress di backend
    // Step 1: 0-20% = 20 ticks
    // Step 2: 20-40% = 20 ticks
    // Step 3: 40-70% = 30 ticks
    // Step 4: 70-100% = 30 ticks
    const ticksPerStep = [20, 20, 30, 30];
    const totalTicks = ticksPerStep[stepIndex] || 20;
    const totalDuration = duration * totalTicks;

    const percentage = (elapsedTime / totalDuration) * 100;

    return Math.min(percentage, 100);
  }, [elapsedTime, duration, isActive, stepIndex]);

  // ✅ Track elapsed time when step is active
  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 100); // Increment every 100ms
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
              'text-slate-400': isPending, // ✅ Tambah warna abu untuk pending
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
        {isActive && <ProgressBar progress={progressPercentage} />}
      </div>
    </div>
  );
};

export default Item;
