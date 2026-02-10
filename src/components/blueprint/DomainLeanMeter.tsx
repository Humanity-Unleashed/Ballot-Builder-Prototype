'use client';

import React, { useRef, useState, useCallback } from 'react';

interface DomainLeanMeterProps {
  /** Value 0-100 representing position on the track (0 = left pole, 100 = right pole) */
  value: number;
  leftLabel: string;
  rightLabel: string;
  onChange: (value: number) => void;
}

export default function DomainLeanMeter({
  value,
  leftLabel,
  rightLabel,
  onChange,
}: DomainLeanMeterProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      onChange(Math.round(ratio * 100));
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      clampValue(e.clientX);
    },
    [clampValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      clampValue(e.clientX);
    },
    [isDragging, clampValue],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {/* Left pole label */}
      <span className="w-[70px] shrink-0 text-right text-[10px] font-bold uppercase leading-[1.2] tracking-[0.3px] text-violet-600">
        {leftLabel}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative flex-1 cursor-pointer py-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Track bar */}
        <div className="h-1.5 rounded-[3px] bg-gray-100">
          {/* 5 notch marks */}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={
                  i === 2
                    ? 'h-2.5 w-px bg-gray-300'
                    : 'h-1.5 w-px bg-gray-200'
                }
              />
            ))}
          </div>

          {/* Draggable dot */}
          <div
            className="pointer-events-none absolute top-1/2"
            style={{
              left: `${value}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="h-3.5 w-3.5 rounded-full bg-violet-600 shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
              style={{
                transform: isDragging ? 'scale(1.2)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.15s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right pole label */}
      <span className="w-[70px] shrink-0 text-left text-[10px] font-bold uppercase leading-[1.2] tracking-[0.3px] text-gray-400">
        {rightLabel}
      </span>
    </div>
  );
}
