'use client';

import classNames from 'classnames';
import React, { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { type DropdownProps } from 'react-day-picker';

import Icon from '../icon';

// Custom dropdown for the calendar month/year navigation.
// Replaces the native select so the option list can be scrollable
// with a constrained max height instead of the very tall OS popup.
const CalendarDropdown = ({ options, value, onChange }: DropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentValue = Number(value);
  const selectedOption = options?.find(
    (option) => option.value === currentValue
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll the active option into view whenever the panel opens.
  useEffect(() => {
    if (isOpen && listRef.current) {
      const active = listRef.current.querySelector<HTMLButtonElement>(
        '[data-active="true"]'
      );
      active?.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

  const handleSelect = (optionValue: number) => {
    if (onChange) {
      onChange({
        target: { value: String(optionValue) },
      } as unknown as ChangeEvent<HTMLSelectElement>);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="hover:bg-primary-50 hover:text-primary-600 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-base font-bold text-neutral-900 transition-colors"
      >
        {selectedOption?.label}
        <Icon icon="TbChevronDown" size={16} />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-1/2 z-30 mt-1 max-h-60 w-32 -translate-x-1/2 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-lg"
        >
          {options?.map((option) => {
            const isActive = option.value === currentValue;
            return (
              <button
                key={option.value}
                type="button"
                data-active={isActive}
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={classNames(
                  'block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                  {
                    'bg-primary-600 font-semibold text-white': isActive,
                    'hover:bg-primary-50 text-neutral-700': !isActive,
                    'cursor-not-allowed opacity-40': option.disabled,
                    'cursor-pointer': !option.disabled,
                  }
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

CalendarDropdown.displayName = 'CalendarDropdown';

export default CalendarDropdown;
