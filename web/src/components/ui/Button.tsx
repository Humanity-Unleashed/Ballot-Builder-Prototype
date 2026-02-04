'use client';

import React from 'react';

interface ButtonProps {
  /** Button text */
  title: string;
  /** Click handler */
  onPress?: () => void;
  /** Alias for onPress */
  onClick?: () => void;
  /** Button style variant */
  variant?: 'primary' | 'outline' | 'ghost';
  /** Disable the button */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  title,
  onPress,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading) {
      (onPress ?? onClick)?.();
    }
  };

  const baseClasses =
    'w-full py-3.5 px-6 rounded-xl text-base font-semibold min-h-[52px] flex items-center justify-center transition-colors duration-150 cursor-pointer';

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    outline:
      'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100',
  };

  const disabledClasses = 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-200';

  const classes = [
    baseClasses,
    disabled ? disabledClasses : variantClasses[variant],
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        title
      )}
    </button>
  );
}
