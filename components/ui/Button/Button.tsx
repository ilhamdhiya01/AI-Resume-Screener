'use client';

import classNames from 'classnames';
import React, { forwardRef, useMemo } from 'react';
import { tv } from 'tailwind-variants';

import Icon, { IconProps } from '../Icon';

export const BUTTON_VARIANT = ['contained', 'outlined', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANT)[number];
export const BUTTON_TYPE = ['button', 'submit', 'reset'] as const;
export type ButtonType = (typeof BUTTON_TYPE)[number];
export const BUTTON_SIZE = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZE)[number];
export const THEME_VARIANT = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
] as const;
export type ThemeVariant = (typeof THEME_VARIANT)[number];

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  label: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: ButtonType;
  color?: ThemeVariant;
  fullWidth?: boolean;
  iconButton?: IconProps['icon'];
  isLoading?: boolean;
  preffixIcon?: IconProps['icon'];
  suffixIcon?: IconProps['icon'];
  link?: string;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      label,
      fullWidth,
      size = 'md',
      variant = 'contained',
      type = 'button',
      color = 'primary',
      iconButton,
      isLoading = false,
      preffixIcon,
      suffixIcon,
      link,
      className,
      ...props
    },
    ref
  ) => {
    const buttonStyle = useMemo(
      () =>
        tv({
          base: 'inline-flex min-w-[100px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 border font-semibold transition-all duration-200 ease-in-out md:min-w-[120px] rounded-md',
          variants: {
            variant: {
              contained: '',
              outlined: '',
              ghost: 'bg-transparent border-transparent',
            },
            size: {
              sm: 'px-4 py-1.5 text-xs md:py-2 md:text-sm',
              md: 'px-5 py-2 text-sm md:text-base',
              lg: 'px-6 py-2.5 text-base md:py-3',
            },
            color: {
              primary: '',
              secondary: '',
              tertiary: '',
              neutral: '',
            },
            fullWidth: {
              true: 'w-full',
            },
            iconButton: {
              true: 'aspect-square min-h-[25px] min-w-[25px] rounded-md p-[6px] md:min-h-[28px] md:min-w-[28px] md:rounded-lg md:p-2',
            },
            isLoading: {
              true: 'pointer-events-none opacity-50',
            },
          },
          compoundVariants: [
            // Primary + Contained
            {
              variant: 'contained',
              color: 'primary',
              class:
                'bg-primary-700 text-white border-primary-700 hover:bg-primary-800',
            },
            // Primary + Outlined
            {
              variant: 'outlined',
              color: 'primary',
              class: 'border-primary-700 text-primary-700 hover:bg-primary-100',
            },
            // Primary + Ghost
            {
              variant: 'ghost',
              color: 'primary',
              class: 'text-primary-700 hover:bg-primary-100',
            },
            // Secondary + Contained
            {
              variant: 'contained',
              color: 'secondary',
              class:
                'bg-secondary-700 text-white border-secondary-700 hover:bg-secondary-800',
            },
            // Secondary + Outlined
            {
              variant: 'outlined',
              color: 'secondary',
              class:
                'border-secondary-700 text-secondary-700 hover:bg-secondary-100',
            },
            // Secondary + Ghost
            {
              variant: 'ghost',
              color: 'secondary',
              class: 'text-secondary-700 hover:bg-secondary-100',
            },
            // Tertiary + Contained
            {
              variant: 'contained',
              color: 'tertiary',
              class:
                'bg-tertiary-700 text-white border-tertiary-700 hover:bg-tertiary-800',
            },
            // Tertiary + Outlined
            {
              variant: 'outlined',
              color: 'tertiary',
              class:
                'border-tertiary-700 text-tertiary-700 hover:bg-tertiary-100',
            },
            // Tertiary + Ghost
            {
              variant: 'ghost',
              color: 'tertiary',
              class: 'text-tertiary-700 hover:bg-tertiary-100',
            },
            // Neutral + Contained
            {
              variant: 'contained',
              color: 'neutral',
              class:
                'bg-neutral-700 text-white border-neutral-700 hover:bg-neutral-800',
            },
            // Neutral + Outlined
            {
              variant: 'outlined',
              color: 'neutral',
              class: 'border-neutral-300 text-neutral-700 hover:bg-neutral-100',
            },
            // Neutral + Ghost
            {
              variant: 'ghost',
              color: 'neutral',
              class: 'text-neutral-700 hover:bg-neutral-100',
            },
          ],
        }),
      []
    );

    // Compute button classes once
    const buttonClasses = useMemo(
      () =>
        classNames(
          buttonStyle({
            variant,
            size,
            fullWidth,
            iconButton: !!iconButton,
            isLoading,
            color,
          }),
          className
        ),
      [
        buttonStyle,
        variant,
        size,
        fullWidth,
        iconButton,
        isLoading,
        color,
        className,
      ]
    );
    return (
      <button ref={ref} type={type} className={buttonClasses} {...props}>
        {iconButton ? (
          <Icon
            icon={iconButton}
            className={classNames('h-3 w-3 md:h-4 md:w-4', {
              'h-4 w-4 md:h-5 md:w-5': size === 'md',
              'h-5 w-5 md:h-6 md:w-6': size === 'lg',
            })}
          />
        ) : (
          <>
            {preffixIcon && (
              <Icon
                icon={preffixIcon}
                className={classNames('h-3 w-3 md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                  '-order-1': label,
                  'opacity-0': isLoading,
                })}
              />
            )}
            {label}
            {suffixIcon && (
              <Icon
                icon={suffixIcon}
                className={classNames('h-3 w-3 md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                  'order-2': label,
                  'opacity-0': isLoading,
                })}
              />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
