'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  /** Label above the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Hint text below the input */
  hint?: string;
  /** Input type */
  type?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** HTML autocomplete attribute */
  autoComplete?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
}

export default function Input({
  label,
  error,
  hint,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  autoComplete,
  name,
  id,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && isPasswordVisible ? 'text' : type;

  const inputContainerClasses = [
    'flex items-center rounded-xl border px-4 transition-colors duration-150',
    error
      ? 'border-red-500 bg-red-50'
      : isFocused
        ? 'border-blue-500 bg-white'
        : 'border-gray-200 bg-gray-50',
  ].join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id ?? name}
          className="mb-1.5 block text-sm font-semibold text-gray-700"
        >
          {label}
        </label>
      )}

      <div className={inputContainerClasses}>
        <input
          id={id ?? name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent py-3.5 text-base text-gray-900 placeholder-gray-400 outline-none"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
