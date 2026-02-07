'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  valueToPositionIndex,
  positionIndexToValue,
  getGradientSegmentColor,
  getSliderThumbColor,
} from '@/lib/ballotHelpers';
import type { ValueAxis } from '@/lib/ballotHelpers';
import { getSliderConfig } from '@/data/sliderPositions';
import SimpleValueSlider from './SimpleValueSlider';

interface ValueSliderProps {
  axis: ValueAxis;
  onChange: (value: number) => void;
}

/**
 * Interactive value slider using the Pointer Events API.
 *
 * Renders a gradient track with colored segments, a draggable thumb that
 * snaps to discrete positions, and position / pole labels. Falls back to
 * SimpleValueSlider when no slider config exists for the axis.
 */
export default function ValueSlider({ axis, onChange }: ValueSliderProps) {
  const config = getSliderConfig(axis.id);

  if (!config) {
    return <SimpleValueSlider axis={axis} onChange={onChange} />;
  }

  return <ConfiguredSlider axis={axis} onChange={onChange} config={config} />;
}

// ----- Inner component that uses the slider config -----

function ConfiguredSlider({
  axis,
  onChange,
  config,
}: ValueSliderProps & { config: NonNullable<ReturnType<typeof getSliderConfig>> }) {
  const totalPositions = config.positions.length;
  const positionIndex = valueToPositionIndex(axis.value, totalPositions);
  const currentPosition = config.positions[positionIndex];
  const thumbColor = getSliderThumbColor(positionIndex, totalPositions);
  const thumbPercent = (positionIndex / (totalPositions - 1)) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const positionRef = useRef(positionIndex);
  const onChangeRef = useRef(onChange);
  positionRef.current = positionIndex;
  onChangeRef.current = onChange;

  const handlePositionChange = useCallback(
    (newPosIndex: number) => {
      const clamped = Math.max(0, Math.min(totalPositions - 1, newPosIndex));
      const newValue = positionIndexToValue(clamped, totalPositions);
      onChangeRef.current(newValue);
    },
    [totalPositions]
  );

  // Resolve a clientX into a position index using the track bounding rect.
  const resolvePosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const newPos = Math.round(pct * (totalPositions - 1));
      handlePositionChange(newPos);
    },
    [totalPositions, handlePositionChange]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      resolvePosition(e.clientX);
    },
    [resolvePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      resolvePosition(e.clientX);
    },
    [isDragging, resolvePosition]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const accentColor = thumbColor;

  return (
    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
      <p className="text-sm font-semibold text-gray-900">{axis.name}</p>

      {/* Position title card */}
      {currentPosition && (
        <div
          className="border-l-[3px] bg-gray-50 py-1.5 px-2.5 rounded-md space-y-1"
          style={{ borderLeftColor: accentColor }}
        >
          <p className="text-[13px] font-semibold text-gray-700 leading-[18px]">
            {currentPosition.title}
          </p>
          {currentPosition.isCurrentPolicy && (
            <span className="inline-block bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500 tracking-wide">
              Current US Policy
            </span>
          )}
        </div>
      )}

      {/* Slider row: poleA | track | poleB */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-[#8B7AAF] uppercase tracking-wide max-w-[18%] leading-[14px] shrink-0 whitespace-pre-line">
          {config.poleALabel}
        </span>

        <div className="flex-1">
          {/* Track */}
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

          {/* Tick marks */}
          <div className="flex justify-between px-2.5 mt-1.5">
            {Array.from({ length: totalPositions }, (_, idx) => (
              <button
                key={idx}
                onClick={() => handlePositionChange(idx)}
                className="p-1 flex items-center justify-center"
              >
                <div
                  className={[
                    'w-0.5 rounded-sm',
                    idx === positionIndex ? 'h-3 bg-violet-600' : 'h-2 bg-gray-300',
                  ].join(' ')}
                />
              </button>
            ))}
          </div>
        </div>

        <span className="text-[10px] font-semibold text-[#5B9E94] uppercase tracking-wide text-right max-w-[18%] leading-[14px] shrink-0 whitespace-pre-line">
          {config.poleBLabel}
        </span>
      </div>
    </div>
  );
}
