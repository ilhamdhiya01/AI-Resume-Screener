'use client';

import classNames from 'classnames';
import React, { useId } from 'react';
import ReactSelect, {
  GroupBase,
  type Props as ReactSelectProps,
} from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends ReactSelectProps<
  SelectOption,
  false,
  GroupBase<SelectOption>
> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Select = ({
  label,
  error,
  fullWidth,
  required,
  id,
  className,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div
      className={classNames(
        'flex flex-col gap-1',
        fullWidth ? 'w-full' : 'w-fit min-w-[300px]'
      )}
    >
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium select-none">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <ReactSelect
        id={selectId}
        instanceId={selectId}
        className={className}
        classNames={{
          control: (state) =>
            classNames(
              '!min-h-[42px] !rounded !border !bg-white !shadow-none !py-0 !transition-colors !duration-200',
              state.isFocused &&
                '!border-primary-500 !ring-2 !ring-primary-200 !ring-offset-0',
              state.isDisabled && '!bg-gray-100 !opacity-50',
              error ? '!border-red-500' : '!border-neutral-300'
            ),
          valueContainer: () => '!px-3 !py-0.5',
          placeholder: () => '!text-sm !text-gray-400',
          input: () => '!text-sm !text-neutral-800',
          singleValue: () => '!text-sm !text-neutral-800',
          multiValue: () => '!rounded !bg-primary-100 !text-primary-700',
          multiValueLabel: () => '!text-sm',
          indicatorSeparator: () => '!hidden',
          indicatorsContainer: () => '!pr-2',
          dropdownIndicator: () => '!text-neutral-400',
          menu: () => '!mt-1 !rounded !border !border-neutral-200 !shadow-lg',
          option: (state) =>
            classNames(
              '!px-3 !py-2 !text-sm !text-neutral-800',
              state.isFocused && '!bg-primary-50',
              state.isSelected && '!bg-primary-100 !text-primary-700'
            ),
          noOptionsMessage: () => '!py-2 !text-sm !text-gray-400',
        }}
        {...props}
      />
      {error && <small className="text-xs text-red-500">{error}</small>}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
