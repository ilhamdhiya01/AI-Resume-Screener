'use client';

import classNames from 'classnames';
import { format } from 'date-fns';
import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type DateRange, DayPicker } from 'react-day-picker';

import Button from '../button';
import Icon from '../icon';
import CalendarDropdown from './CalendarDropdown';

interface SingleDatePickerProps {
  mode: 'single';
  value: Date | null;
  onChange: (value: Date | null) => void;
}

interface RangeDatePickerProps {
  mode: 'range';
  value: { from: Date | null; to: Date | null };
  onChange: (value: { from: Date | null; to: Date | null }) => void;
}

type DatePickerProps = {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  placeholder?: string;
} & (SingleDatePickerProps | RangeDatePickerProps);

const getSingleDisplayText = (value: Date | null): string | null => {
  return value ? format(value, 'dd MMM yyyy') : null;
};

const getRangeDisplayText = (value: {
  from: Date | null;
  to: Date | null;
}): string | null => {
  if (value.from && value.to) {
    return `${format(value.from, 'dd MMM yyyy')} – ${format(value.to, 'dd MMM yyyy')}`;
  }
  if (value.from) {
    return `${format(value.from, 'dd MMM yyyy')} – ...`;
  }
  return null;
};

// Bounds for the month/year dropdown so users can jump across years.
const DROPDOWN_START = new Date(1950, 0);
const DROPDOWN_END = new Date(new Date().getFullYear() + 10, 11);

const DatePicker = ({
  label,
  error,
  fullWidth,
  required,
  mode,
  value,
  onChange,
  placeholder,
}: DatePickerProps) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Draft state holds the temporary selection while the dropdown is open.
  const [draft, setDraft] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const displayText = useMemo(
    () =>
      mode === 'single'
        ? getSingleDisplayText(value as Date | null)
        : getRangeDisplayText(value as { from: Date | null; to: Date | null }),
    [mode, value]
  );

  const hasValue = useMemo(() => {
    if (mode === 'single') return !!value;
    return !!(value as { from: Date | null; to: Date | null }).from;
  }, [mode, value]);

  const handleOpen = useCallback(() => {
    if (mode === 'range') {
      setDraft(value as { from: Date | null; to: Date | null });
    }
    setIsOpen(true);
  }, [mode, value]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode === 'single') {
        onChange(null);
      } else {
        onChange({ from: null, to: null });
      }
    },
    [mode, onChange]
  );

  const handleApply = useCallback(() => {
    if (mode === 'range') {
      onChange({
        from: draft.from,
        to: draft.to,
      });
    }
    setIsOpen(false);
  }, [mode, draft, onChange]);

  const handleCancel = useCallback(() => {
    if (mode === 'range') {
      setDraft(value as { from: Date | null; to: Date | null });
    }
    setIsOpen(false);
  }, [mode, value]);

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

  return (
    <div
      ref={containerRef}
      className={classNames(
        'relative flex flex-col gap-1',
        fullWidth ? 'w-full' : 'w-fit min-w-[300px]'
      )}
    >
      {label && (
        <label htmlFor={id} className="text-sm font-medium select-none">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        id={id}
        onClick={handleOpen}
        className={classNames(
          'flex min-h-[42px] cursor-pointer items-center gap-2 rounded border bg-white px-3 py-2 text-left transition-colors duration-200',
          {
            'border-red-500': error,
            'hover:border-primary-400 border-neutral-300': !error,
            'w-full': fullWidth,
          }
        )}
      >
        <Icon
          icon="TbCalendar"
          size={18}
          className="shrink-0 text-neutral-400"
        />
        <span
          className={classNames('flex-1 text-sm', {
            'text-gray-400': !displayText,
            'text-neutral-800': displayText,
          })}
        >
          {displayText || placeholder || 'Select date...'}
        </span>
        {hasValue && (
          <span
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:bg-gray-100 hover:text-neutral-600"
          >
            <Icon icon="TbX" size={14} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 rounded-2xl bg-white p-5 shadow-2xl">
          {mode === 'single' ? (
            <DayPicker
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                onChange(date || null);
                setIsOpen(false);
              }}
              captionLayout="dropdown"
              startMonth={DROPDOWN_START}
              endMonth={DROPDOWN_END}
              components={{ Dropdown: CalendarDropdown }}
              classNames={{
                root: 'relative w-full',
                months: 'flex justify-center',
                month: 'w-full',
                month_caption: 'flex items-center justify-center h-10 mb-3',
                dropdowns:
                  'relative z-20 flex items-center justify-center gap-2',
                chevron: 'fill-current',
                nav: 'absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-10 pointer-events-none',
                button_previous:
                  'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer',
                button_next:
                  'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer',
                weekdays: 'flex mb-2',
                weekday:
                  'flex-1 text-center text-sm font-semibold text-neutral-400 uppercase',
                weeks: 'w-full flex flex-col gap-1',
                week: 'flex bg-primary-50 rounded-xl',
                day: 'flex-1 flex items-center justify-center py-1',
                day_button:
                  'w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer',
              }}
            />
          ) : (
            <>
              <DayPicker
                mode="range"
                selected={{
                  from: draft.from || undefined,
                  to: draft.to || undefined,
                }}
                onSelect={(range: DateRange | undefined) => {
                  setDraft({
                    from: range?.from || null,
                    to: range?.to || null,
                  });
                }}
                numberOfMonths={1}
                captionLayout="dropdown"
                startMonth={DROPDOWN_START}
                endMonth={DROPDOWN_END}
                components={{ Dropdown: CalendarDropdown }}
                classNames={{
                  root: 'relative w-full',
                  months: 'flex justify-center',
                  month: 'w-full',
                  month_caption: 'flex items-center justify-center h-10 mb-3',
                  dropdowns:
                    'relative z-20 flex items-center justify-center gap-2',
                  chevron: 'fill-current',
                  nav: 'absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-10 pointer-events-none',
                  button_previous:
                    'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer',
                  button_next:
                    'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer',
                  weekdays: 'flex mb-2',
                  weekday:
                    'flex-1 text-center text-sm font-semibold text-neutral-400 uppercase',
                  weeks: 'w-full flex flex-col gap-1',
                  week: 'flex bg-primary-50 rounded-xl',
                  day: 'flex-1 flex items-center justify-center py-1',
                  day_button:
                    'w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer',
                }}
              />
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
                >
                  Cancel
                </button>
                <Button
                  label="Apply Range"
                  size="sm"
                  onClick={handleApply}
                  disabled={!draft.from || !draft.to}
                />
              </div>
            </>
          )}
        </div>
      )}

      {error && <small className="text-xs text-red-500">{error}</small>}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';

export default DatePicker;
