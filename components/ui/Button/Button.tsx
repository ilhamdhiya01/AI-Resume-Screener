/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import classNames from 'classnames';
import Link from 'next/link';
import React, { forwardRef, useMemo } from 'react';
import { tv } from 'tailwind-variants';

import Icon, { IconProps } from '../icon';

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
  'danger',
  'success',
  'warning',
] as const;
export type ThemeVariant = (typeof THEME_VARIANT)[number] | (string & {});

interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  label?: string;
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
      disabled = false,
      preffixIcon,
      suffixIcon,
      link,
      className,
      ...props
    },
    ref
  ) => {
    const isBrandColor = THEME_VARIANT.includes(color as any);

    // const customStyle = useMemo(() => {
    //   if (isBrandColor) return {};

    //   // Jika inputnya seperti "bg-pink-500", kita bisa taruh di className
    //   // Jika inputnya kode hex seperti "#ff00ff", kita taruh di inline style
    //   if (color.startsWith('#')) {
    //     return variant === 'contained'
    //       ? { backgroundColor: color, color: 'white', borderColor: color }
    //       : { color: color, borderColor: color };
    //   }
    //   return {};
    // }, [color, isBrandColor, variant]);

    const buttonStyle = useMemo(
      () =>
        tv({
          base: 'inline-flex min-w-[100px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 border font-semibold transition-all duration-200 ease-in-out md:min-w-[120px] rounded-md leading-none',
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
              danger: '',
              success: '',
              warning: '',
            },
            fullWidth: {
              true: 'w-full',
            },
            iconButton: {
              true: '!min-w-0 aspect-square h-10 w-10 rounded-md p-2 md:h-11 md:w-11 md:p-2.5',
            },
            isLoading: {
              true: 'pointer-events-none opacity-50',
            },
            disabled: {
              true: 'pointer-events-none opacity-50',
            },
          },
          compoundVariants: [
            // Primary + Contained
            {
              variant: 'contained',
              color: 'primary',
              class:
                'bg-primary-600 text-white border-primary-700 hover:bg-primary-800',
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
            // Danger + Contained
            {
              variant: 'contained',
              color: 'danger',
              class: 'bg-red-700 text-white border-red-700 hover:bg-red-800',
            },
            // red + Outlined
            {
              variant: 'outlined',
              color: 'danger',
              class: 'border-red-700 text-red-700 hover:bg-red-100',
            },
            // red + Ghost
            {
              variant: 'ghost',
              color: 'danger',
              class: 'text-red-600 hover:bg-red-100',
            },
            // Success + Contained
            {
              variant: 'contained',
              color: 'success',
              class:
                'bg-green-700 text-white border-green-700 hover:bg-green-800',
            },
            // Success + Outlined
            {
              variant: 'outlined',
              color: 'success',
              class: 'border-green-700 text-green-700 hover:bg-green-100',
            },
            // Success + Ghost
            {
              variant: 'ghost',
              color: 'success',
              class: 'text-green-700 hover:bg-green-100',
            },
            // Warning + Contained
            {
              variant: 'contained',
              color: 'warning',
              class:
                'bg-yellow-700 text-white border-yellow-700 hover:bg-yellow-800',
            },
            // Warning + Outlined
            {
              variant: 'outlined',
              color: 'warning',
              class: 'border-yellow-700 text-yellow-700 hover:bg-yellow-100',
            },
            // Warning + Ghost
            {
              variant: 'ghost',
              color: 'warning',
              class: 'text-yellow-700 hover:bg-yellow-100',
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
            disabled,
            color: isBrandColor ? (color as any) : undefined,
          }),
          !isBrandColor ? color : '',
          className
        ),
      [
        buttonStyle,
        variant,
        size,
        fullWidth,
        iconButton,
        isLoading,
        disabled,
        color,
        className,
        isBrandColor,
      ]
    );

    const Button = (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled}
        // style={customStyle}
        {...props}
      >
        {iconButton ? (
          <>
            {isLoading ? (
              <Icon
                icon="TbLoader2"
                className={classNames('h-3 w-3 animate-spin md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                })}
              />
            ) : (
              <Icon
                icon={iconButton}
                className={classNames('h-3 w-3 md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                })}
              />
            )}
          </>
        ) : (
          <span className="flex items-center gap-2 select-none">
            {preffixIcon && !isLoading && (
              <Icon
                icon={preffixIcon}
                className={classNames('h-3 w-3 md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                })}
              />
            )}
            {isLoading && (
              <Icon
                icon="TbLoader2"
                className={classNames('h-3 w-3 animate-spin md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                })}
              />
            )}
            {label}
            {suffixIcon && !isLoading && (
              <Icon
                icon={suffixIcon}
                className={classNames('h-3 w-3 md:h-4 md:w-4', {
                  'h-4 w-4 md:h-5 md:w-5': size === 'md',
                  'h-5 w-5 md:h-6 md:w-6': size === 'lg',
                })}
              />
            )}
          </span>
        )}
      </button>
    );
    return <>{link ? <Link href={link}>{Button}</Link> : Button}</>;
  }
);

Button.displayName = 'Button';

export default Button;
