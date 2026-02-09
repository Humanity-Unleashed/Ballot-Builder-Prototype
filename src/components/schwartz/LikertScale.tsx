'use client';

import React from 'react';

interface LikertScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}

const LABELS = [
  { value: 1 as const, label: 'Strongly Disagree' },
  { value: 2 as const, label: 'Disagree' },
  { value: 3 as const, label: 'Neutral' },
  { value: 4 as const, label: 'Agree' },
  { value: 5 as const, label: 'Strongly Agree' },
];

export default function LikertScale({ value, onChange, disabled = false }: LikertScaleProps) {
  return (
    <div className="w-full">
      {/* Mobile: Stacked buttons */}
      <div className="flex flex-col gap-2 sm:hidden">
        {LABELS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              w-full rounded-lg px-4 py-3 text-sm font-medium transition-all
              ${
                value === option.value
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Desktop: Horizontal scale */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between gap-2">
          {LABELS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`
                flex-1 rounded-lg px-2 py-3 text-xs font-medium transition-all
                ${
                  value === option.value
                    ? 'bg-violet-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
