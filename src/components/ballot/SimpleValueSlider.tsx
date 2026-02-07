'use client';

import React, { useRef, useState, useCallback } from 'react';
import { getGradientSegmentColor, getSliderThumbColor } from '@/lib/ballotHelpers';
import type { ValueAxis } from '@/lib/ballotHelpers';

interface SimpleValueSliderProps {
  axis: ValueAxis;
  onChange: (value: number) => void;
}

/**
 * Simpler value slider used as a fallback when no detailed slider config
 * exists for an axis. Uses the Pointer Events API just like ValueSlider
 * but renders without position cards or tick marks.
 */
export default function SimpleValueSlider({ axis, onChange }: SimpleValueSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const resolveValue = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newVal = Math.round(pct * 10);
    onChangeRef.current(newVal);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      resolveValue(e.clientX);
    },
    [resolveValue]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      resolveValue(e.clientX);
    },
    [isDragging, resolveValue]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const thumbColor = getSliderThumbColor(axis.value, 11);
  const thumbPercent = (axis.value / 10) * 100;

  return (
    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
      <p className="text-sm font-semibold text-gray-900">{axis.name}</p>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-[#8B7AAF] uppercase tracking-wide max-w-[18%] leading-[14px] shrink-0">
          {axis.poleA}
        </span>

        <div className="flex-1">
          <div
            ref={trackRef}
            className="relative h-3 rounded-md flex overflow-hidden cursor-pointer touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{ backgroundColor: getGradientSegmentColor(i, 20) }}
              />
            ))}

            {/* Thumb */}
            <div
              className="absolute top-1/2 w-7 h-7 bg-white rounded-full -ml-3.5 -mt-3.5 shadow-md flex items-center justify-center transition-transform"
              style={{
                left: `${thumbPercent}%`,
                borderWidth: 3.5,
                borderStyle: 'solid',
                borderColor: thumbColor,
                transform: isDragging ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: thumbColor }} />
            </div>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-[#5B9E94] uppercase tracking-wide text-right max-w-[18%] leading-[14px] shrink-0">
          {axis.poleB}
        </span>
      </div>
    </div>
  );
}
