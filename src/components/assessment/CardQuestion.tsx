'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Mic, Check, ChevronDown } from 'lucide-react';
import type { AxisSliderConfig } from '@/data/sliderPositions';

interface CardQuestionProps {
  axisConfig: AxisSliderConfig;
  /** Whether this axis has enhanced NLP escape hatch (T4 nuanced axis) */
  isNuancedAxis: boolean;
  /** Called when user selects a card */
  onSelect: (value: number, dwellTimeMs: number) => void;
  /** Called when user taps "None of these fit" */
  onEscapeHatch: () => void;
  /** Called when user skips */
  onSkip: () => void;
  disabled?: boolean;
}

/** Compute card values from position count: evenly spaced on [0, 10] */
function computeCardValues(positionCount: number): number[] {
  if (positionCount <= 1) return [5];
  return Array.from({ length: positionCount }, (_, i) =>
    (i / (positionCount - 1)) * 10,
  );
}

export default function CardQuestion({
  axisConfig,
  isNuancedAxis,
  onSelect,
  onEscapeHatch,
  onSkip,
  disabled = false,
}: CardQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const mountTimeRef = useRef(0);
  useEffect(() => { mountTimeRef.current = Date.now(); }, []);

  const cardValues = useMemo(
    () => computeCardValues(axisConfig.positions.length),
    [axisConfig.positions.length],
  );

  // Randomly flip the display order per question to avoid top-always-progressive bias.
  // Determined once per mount (per axisConfig.axisId) so it doesn't change while answering.
  const isFlipped = useMemo(
    () => Math.random() < 0.5,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axisConfig.axisId],
  );

  // Build display-order indices: either [0,1,2,3,4] or [4,3,2,1,0]
  const displayOrder = useMemo(() => {
    const indices = axisConfig.positions.map((_, i) => i);
    return isFlipped ? indices.reverse() : indices;
  }, [axisConfig.positions, isFlipped]);

  const handleCardTap = (index: number) => {
    if (disabled || confirmed) return;
    // Toggle selection — tapping same card deselects
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  const handleConfirm = () => {
    if (selectedIndex === null || disabled) return;
    const dwellTimeMs = Date.now() - mountTimeRef.current;
    const value = cardValues[selectedIndex];
    setConfirmed(true);
    onSelect(value, dwellTimeMs);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Question */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {axisConfig.question}
        </h2>
      </div>

      {/* Position cards + inline action */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {displayOrder.map((originalIndex) => {
            const position = axisConfig.positions[originalIndex];
            const isSelected = selectedIndex === originalIndex;
            const isCurrentPolicy = position.isCurrentPolicy;
            const hasTradeoffs = position.tradeoffs && position.tradeoffs.length > 0;

            return (
              <div key={originalIndex}>
                <button
                  onClick={() => handleCardTap(originalIndex)}
                  disabled={disabled || confirmed}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/[0.04] shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isSelected && hasTradeoffs ? 'rounded-b-none border-b-0' : ''} ${
                    disabled || confirmed ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-semibold ${
                          isSelected ? 'text-brand-primary' : 'text-gray-900'
                        }`}>
                          {position.title}
                        </span>
                        {isCurrentPolicy && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-500 shrink-0">
                            Current policy
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
                        {position.description}
                      </p>
                    </div>

                    {/* Expand indicator for tradeoffs */}
                    {hasTradeoffs && (
                      <ChevronDown
                        className={`h-4 w-4 mt-1 shrink-0 transition-transform duration-200 ${
                          isSelected ? 'rotate-180 text-brand-primary' : 'text-gray-300'
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Expand-on-select tradeoffs */}
                {isSelected && hasTradeoffs && (
                  <div className="border-2 border-t-0 border-brand-primary bg-brand-primary/[0.02] rounded-b-xl px-4 pb-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Key tradeoffs
                    </p>
                    <ul className="space-y-1.5">
                      {position.tradeoffs!.map((tradeoff, ti) => (
                        <li
                          key={ti}
                          className="text-[12px] text-gray-600 leading-snug pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-gray-300"
                        >
                          {tradeoff}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Escape hatch — "None of these fit" */}
        <button
          onClick={onEscapeHatch}
          disabled={disabled || confirmed}
          className={`w-full mt-3 p-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 border-brand-primary/40 bg-brand-primary/[0.05] hover:border-brand-primary/60 hover:bg-brand-primary/[0.08] ${
            disabled || confirmed ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Mic className="h-4 w-4 text-brand-primary/70" />
          <span className="text-[13px] font-medium text-brand-primary/80">
            None of these fit — tell us in your own words
          </span>
        </button>

        {isNuancedAxis && (
          <p className="text-[11px] text-gray-400 text-center mt-1.5 px-4">
            This topic has a lot of nuance. Feel free to explain your view.
          </p>
        )}

        {/* Inline action — appears right after the cards */}
        <div className="mt-3">
          {selectedIndex !== null && !confirmed ? (
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={onSkip}
              disabled={disabled}
              className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Skip this question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
