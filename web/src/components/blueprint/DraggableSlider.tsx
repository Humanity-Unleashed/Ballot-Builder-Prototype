'use client';

import React, { useRef, useState, useCallback } from 'react';
import { getSliderThumbColor, getGradientSegmentColor } from '@/lib/blueprintHelpers';

interface DraggableSliderProps {
  position: number;
  totalPositions: number;
  onPositionChange: (pos: number) => void;
  poleALabel: string;
  poleBLabel: string;
}

export default function DraggableSlider({
  position,
  totalPositions,
  onPositionChange,
  poleALabel,
  poleBLabel,
}: DraggableSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = x / rect.width;
      const newPos = Math.round(ratio * (totalPositions - 1));
      const clamped = Math.max(0, Math.min(totalPositions - 1, newPos));
      onPositionChange(clamped);
    },
    [totalPositions, onPositionChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      clampPosition(e.clientX);
    },
    [clampPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      clampPosition(e.clientX);
    },
    [isDragging, clampPosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const thumbColor = getSliderThumbColor(position, totalPositions);
  const thumbPct = (position / (totalPositions - 1)) * 100;

  return (
    <div className="mt-5 flex items-center gap-2">
      {/* Pole A label */}
      <span className="max-w-[20%] shrink text-left text-[11px] font-semibold uppercase leading-[15px] tracking-wide text-[#8B7AAF]">
        {poleALabel}
      </span>

      {/* Track area */}
      <div className="flex-1">
        {/* Gradient track with pointer events */}
        <div
          ref={trackRef}
          className="relative flex h-3 cursor-pointer overflow-hidden rounded-md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* Gradient segments */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="h-full flex-1"
              style={{ backgroundColor: getGradientSegmentColor(i, 20) }}
            />
          ))}

          {/* Thumb */}
          <div
            className="pointer-events-none absolute top-1/2 flex items-center justify-center rounded-full border-4 bg-white shadow-md"
            style={{
              left: `${thumbPct}%`,
              width: 36,
              height: 36,
              marginLeft: -18,
              marginTop: -18,
              borderColor: thumbColor,
              transform: isDragging ? 'scale(1.15)' : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.15s ease',
            }}
          >
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: thumbColor }}
            />
          </div>
        </div>

        {/* Tick marks */}
        <div className="mt-2 flex justify-between px-3.5">
          {Array.from({ length: totalPositions }, (_, idx) => (
            <button
              key={idx}
              className="p-1"
              onClick={() => onPositionChange(idx)}
              aria-label={`Position ${idx + 1}`}
            >
              <div
                className={[
                  'w-0.5 rounded-sm transition-colors',
                  idx === position ? 'h-3 bg-violet-600' : 'h-2 bg-gray-300',
                ].join(' ')}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Pole B label */}
      <span className="max-w-[20%] shrink text-right text-[11px] font-semibold uppercase leading-[15px] tracking-wide text-[#5B9E94]">
        {poleBLabel}
      </span>
    </div>
  );
}
