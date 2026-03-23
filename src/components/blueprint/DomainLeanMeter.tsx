'use client';

import React, { useRef, useState, useCallback } from 'react';

interface DomainLeanMeterProps {
  /** Value 0-100 representing position on the track (0 = left pole, 100 = right pole) */
  value: number;
  leftLabel: string;
  rightLabel: string;
  onChange: (value: number) => void;
  /** Compact variant: smaller track, dot, and labels for per-axis display */
  compact?: boolean;
}

export default function DomainLeanMeter({
  value,
  leftLabel,
  rightLabel,
  onChange,
  compact = false,
}: DomainLeanMeterProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Local draft value used during drag to avoid triggering store recalculations mid-drag
  const [draftValue, setDraftValue] = useState<number | null>(null);

  const displayValue = draftValue ?? value;

  const computeValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      return Math.round(ratio * 100);
    },
    [value],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      setDraftValue(computeValue(e.clientX));
    },
    [computeValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setDraftValue(computeValue(e.clientX));
    },
    [isDragging, computeValue],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (draftValue !== null) {
      onChange(draftValue);
      setDraftValue(null);
    }
  }, [draftValue, onChange]);

  const trackHeight = compact ? 'h-1' : 'h-1.5';
  const trackRadius = compact ? 'rounded-[2px]' : 'rounded-[3px]';
  const trackPadding = compact ? 'py-1.5' : 'py-2';
  const centerNotch = compact ? 'h-2 w-px bg-gray-300' : 'h-2.5 w-px bg-gray-300';
  const sideNotch = compact ? 'h-1 w-px bg-gray-200' : 'h-1.5 w-px bg-gray-200';
  const dotSize = compact
    ? 'h-2.5 w-2.5 rounded-full bg-brand-primary shadow-[0_1px_3px_rgba(0,0,0,0.18)]'
    : 'h-3.5 w-3.5 rounded-full bg-brand-primary shadow-[0_1px_4px_rgba(0,0,0,0.2)]';

  const leftLabelClass = compact
    ? `w-[80px] shrink-0 text-right text-[10px] font-semibold leading-snug ${displayValue < 50 ? 'text-brand-primary' : 'text-gray-400'}`
    : `w-[70px] shrink-0 text-right text-[10px] font-bold uppercase leading-[1.2] tracking-[0.3px] ${displayValue < 50 ? 'text-brand-primary' : 'text-gray-400'}`;

  const rightLabelClass = compact
    ? `w-[80px] shrink-0 text-left text-[10px] font-semibold leading-snug ${displayValue > 50 ? 'text-brand-primary' : 'text-gray-400'}`
    : `w-[70px] shrink-0 text-left text-[10px] font-bold uppercase leading-[1.2] tracking-[0.3px] ${displayValue > 50 ? 'text-brand-primary' : 'text-gray-400'}`;

  return (
    <div className="flex items-center gap-1.5">
      {/* Left pole label */}
      <span className={leftLabelClass}>
        {leftLabel}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        className={`relative flex-1 cursor-pointer ${trackPadding}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Track bar */}
        <div className={`${trackHeight} ${trackRadius} bg-gray-100`}>
          {/* 5 notch marks */}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={i === 2 ? centerNotch : sideNotch}
              />
            ))}
          </div>

          {/* Draggable dot */}
          <div
            className="pointer-events-none absolute top-1/2"
            style={{
              left: `${displayValue}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={dotSize}
              style={{
                transform: isDragging ? 'scale(1.2)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.15s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right pole label */}
      <span className={rightLabelClass}>
        {rightLabel}
      </span>
    </div>
  );
}
