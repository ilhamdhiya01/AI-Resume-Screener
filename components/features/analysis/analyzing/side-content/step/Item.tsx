import classNames from 'classnames';
import React, { useMemo } from 'react';

import Icon, { IconProps } from '@/components/ui/icon';

import ProgressBar from './ProgressBar';

interface ItemProps {
  isLast: boolean;
  isActive: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
  stepIndex: number;
}

const Item = ({
  isLast,
  isActive,
  isCompleted,
  title,
  description,
  stepIndex,
}: ItemProps) => {
  const isPending = !isActive && !isCompleted;

  const icon: IconProps['icon'] = useMemo(() => {
    if (isActive) return 'FiActivity';
    if (isCompleted) return 'TbCheck';

    return `TbNumber${stepIndex + 1}` as IconProps['icon'];
  }, [isActive, isCompleted, stepIndex]);

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
        {isActive && <ProgressBar progress={50} />}
      </div>
    </div>
  );
};

export default Item;
