import classNames from 'classnames';
import React, { useMemo } from 'react';

import Icon, { IconProps } from '@/components/ui/icon';

interface AnalysisItemProps {
  isCritical?: boolean;
  isSuggestions?: boolean;
  isStrengths?: boolean;
  title: string;
  items: string[];
}

const AnalysisItem = React.memo(
  ({
    isCritical = false,
    isSuggestions = false,
    isStrengths = false,
    title,
    items,
  }: AnalysisItemProps) => {
    const icon: IconProps['icon'] = useMemo(() => {
      if (isCritical) return 'TbAlertHexagonFilled';
      if (isSuggestions) return 'FaLightbulb';
      if (isStrengths) return 'TbStarFilled';
      return 'TbAlertHexagonFilled';
    }, [isCritical, isSuggestions, isStrengths]);
    return (
      <div
        className={classNames('space-y-5 rounded-xl border p-5', {
          'border-red-300 bg-red-50/30': isCritical,
          'border-tertiary-300 bg-tertiary-50/30': isSuggestions,
          'border-primary-300 bg-primary-100/50': isStrengths,
        })}
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span
              className={classNames(
                'flex size-8 items-center justify-center rounded-lg',
                {
                  'bg-red-200': isCritical,
                  'bg-tertiary-200': isSuggestions,
                  'bg-primary-200': isStrengths,
                }
              )}
            >
              <Icon
                icon={icon}
                className={classNames({
                  'text-red-600': isCritical,
                  'text-tertiary-600': isSuggestions,
                  'text-primary-600': isStrengths,
                })}
                size={18}
              />
            </span>
            <span
              className={classNames('font-semibold', {
                'text-red-600': isCritical,
                'text-tertiary-600': isSuggestions,
                'text-primary-600': isStrengths,
              })}
            >
              {title}
            </span>
          </div>
          <span
            className={classNames(
              'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
              {
                'bg-red-600': isCritical,
                'bg-tertiary-600': isSuggestions,
                'bg-primary-600': isStrengths,
              }
            )}
          >
            {items.length}
          </span>
        </div>
        <ul
          className={classNames(
            'list-outside list-disc space-y-3 pl-4 text-sm font-semibold',
            {
              'marker:text-red-600': isCritical,
              'marker:text-tertiary-600': isSuggestions,
              'marker:text-primary-600': isStrengths,
            }
          )}
        >
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
);

AnalysisItem.displayName = 'AnalysisItem';

export default AnalysisItem;
