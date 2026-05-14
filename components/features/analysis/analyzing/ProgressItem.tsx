import classNames from 'classnames';

import Icon from '@/components/ui/icon';

interface ProgressItemProps {
  isActive: boolean;
  isCompleted: boolean;
  title: string;
  description: string;
}

const ProgressItem = ({
  isActive,
  isCompleted,
  title,
  description,
}: ProgressItemProps) => {
  // ✅ Simplified logic: cuma 3 state (pending, active, completed)
  const isPending = !isActive && !isCompleted;

  return (
    <div
      className={classNames('flex items-center gap-4 rounded-2xl p-4', {
        'border-primary-500 bg-primary-200 border': isActive,
        'border border-slate-300 bg-white': isCompleted,
        'border border-slate-300 bg-neutral-50': isPending,
      })}
    >
      <div
        className={classNames(
          'flex size-8 items-center justify-center rounded-full',
          {
            'bg-primary-200': isActive,
            'bg-green-200': isCompleted,
            'bg-neutral-200': isPending,
          }
        )}
      >
        <Icon
          icon={
            isActive ? 'TbRefresh' : isCompleted ? 'TbCheck' : 'TbHourglass'
          }
          className={classNames('stroke-3', {
            'text-primary-700 animate-spin': isActive,
            'text-green-700': isCompleted,
            'text-neutral-700/20': isPending,
          })}
          size={20}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span
          className={classNames('text-lg leading-none font-semibold', {
            'text-primary-700': isActive,
            'text-neutral-700': isCompleted,
            'text-neutral-700/30': isPending,
          })}
        >
          {title}
        </span>
        <p
          className={classNames('text-sm leading-none', {
            'text-primary-500': isActive,
            'text-neutral-500': isCompleted,
            'text-neutral-500/30': isPending,
          })}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProgressItem;
