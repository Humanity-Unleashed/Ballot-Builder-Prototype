'use client';

import React from 'react';
import { STRENGTH_LEVELS, getImportanceLabel } from '@/lib/blueprintHelpers';

interface StrengthChipsProps {
  selectedValue: number;
  onSelect: (value: number) => void;
}

export default function StrengthChips({ selectedValue, onSelect }: StrengthChipsProps) {
  const selectedLabel = getImportanceLabel(selectedValue);

  return (
    <div className="mt-5">
      <p className="mb-2.5 text-center text-[13px] font-semibold text-gray-500">
        How strongly do you feel?
      </p>
      <div className="flex justify-center gap-2.5">
        {STRENGTH_LEVELS.map((level) => {
          const isSelected = level.label === selectedLabel;
          return (
            <button
              key={level.label}
              onClick={() => onSelect(level.value)}
              className={[
                'rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-violet-600 bg-violet-50 text-violet-600'
                  : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400',
              ].join(' ')}
            >
              {level.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
