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
  return (
    <div
      className={classNames('flex items-center gap-4 rounded-2xl border p-4', {
        'border-primary-500 bg-primary-200': isActive,
        'border-slate-300 bg-white': isCompleted,
      })}
    >
      <div
        className={classNames(
          'flex size-8 items-center justify-center rounded-full bg-neutral-100',
          {
            'bg-primary-200': isActive,
            'bg-green-200': isCompleted,
          }
        )}
      >
        <Icon
          icon={
            isActive ? 'TbRefresh' : isCompleted ? 'TbCheck' : 'TbHourglass'
          }
          className={classNames('text-neutral-700/20', {
            'text-primary-700 animate-spin stroke-3': isActive,
            'text-green-700': isCompleted,
          })}
          size={20}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span
          className={classNames(
            'text-lg leading-none font-semibold text-neutral-700/30',
            {
              'text-primary-700': isActive,
              'text-neutral-700': isCompleted,
            }
          )}
        >
          {title}
        </span>
        <p
          className={classNames('text-sm leading-none text-neutral-500/30', {
            'text-primary-500': isActive,
            'text-neutral-500': isCompleted,
          })}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProgressItem;
