'use client';

import React from 'react';

interface ImportanceSliderProps {
  /** Value from 1–10 */
  value: number;
  onChange: (value: number) => void;
}

export default function ImportanceSlider({ value, onChange }: ImportanceSliderProps) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-center text-[13px] font-semibold text-gray-500">
        How important is this to you?
      </p>
      <div className="flex items-center gap-3 px-1">
        <span className="w-14 shrink-0 text-right text-[11px] font-semibold text-gray-400">
          Not very
        </span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="importance-slider h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-primary"
        />
        <span className="w-14 shrink-0 text-left text-[11px] font-semibold text-gray-400">
          Very
        </span>
      </div>
    </div>
  );
}
