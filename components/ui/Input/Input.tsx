import classNames from 'classnames';
import React, { forwardRef, useId } from 'react';

import Icon, { IconProps } from '../icon';

type SuffixAndPrefix = {
  suffix?: {
    icon: IconProps['icon'];
    onClick?: () => void;
  };
  prefix?: {
    icon: IconProps['icon'];
    onClick?: () => void;
  };
};

interface InputProps extends Omit<
  React.ComponentPropsWithRef<'input'>,
  'prefix' | 'suffix'
> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  id?: string;
  suffix?: SuffixAndPrefix['suffix'];
  prefix?: SuffixAndPrefix['prefix'];
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, fullWidth, required, id, suffix, prefix, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium select-none">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                prefix.onClick?.();
              }}
              className={classNames(
                'absolute inset-y-0 left-0 flex items-center pl-3',
                {
                  'cursor-pointer': prefix.onClick,
                }
              )}
            >
              <Icon icon={prefix.icon} size={18} className="text-neutral-400" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={classNames(
              'block rounded border border-neutral-300 py-2 transition-colors duration-200 placeholder:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 focus:outline-none disabled:bg-gray-100 disabled:opacity-50',
              {
                'border-red-500 focus:border-red-500 focus:ring-red-200': error,
                'focus:border-primary-500 focus:ring-primary-200 border-gray-300':
                  !error,
                'w-full': fullWidth,
                'pr-3 pl-10': prefix,
                'px-3 pr-10': suffix,
                'px-3': !prefix && !suffix,
              }
            )}
            {...props}
          />
          {suffix && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                suffix.onClick?.();
              }}
              className={classNames(
                'absolute inset-y-0 right-0 flex items-center pr-3',
                {
                  'cursor-pointer': suffix.onClick,
                }
              )}
            >
              <Icon icon={suffix.icon} size={18} className="text-neutral-400" />
            </div>
          )}
        </div>
        {error && <small className="text-xs text-red-500">{error}</small>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
