'use client';

import React, { useState, useRef } from 'react';
import { MessageSquareText, Check } from 'lucide-react';
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

/** Map 5-position index to 0-10 scale value */
const CARD_VALUES = [0, 2.5, 5.0, 7.5, 10.0];

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
  const mountTimeRef = useRef(Date.now());

  const handleCardTap = (index: number) => {
    if (disabled || confirmed) return;
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    if (selectedIndex === null || disabled) return;
    const dwellTimeMs = Date.now() - mountTimeRef.current;
    const value = CARD_VALUES[selectedIndex];
    setConfirmed(true);
    onSelect(value, dwellTimeMs);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Question */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-lg font-bold text-gray-900 leading-snug">
          {axisConfig.question}
        </h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] font-semibold text-[#8B7AAF] uppercase tracking-wide">
            {axisConfig.poleALabel.replace(/\n/g, ' ')}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold text-[#5B9E94] uppercase tracking-wide">
            {axisConfig.poleBLabel.replace(/\n/g, ' ')}
          </span>
        </div>
      </div>

      {/* Position cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="space-y-2">
          {axisConfig.positions.map((position, index) => {
            const isSelected = selectedIndex === index;
            const isCurrentPolicy = position.isCurrentPolicy;

            return (
              <button
                key={index}
                onClick={() => handleCardTap(index)}
                disabled={disabled || confirmed}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/[0.04] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${disabled || confirmed ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                </div>
              </button>
            );
          })}
        </div>

        {/* Escape hatch — "None of these fit" */}
        <button
          onClick={onEscapeHatch}
          disabled={disabled || confirmed}
          className={`w-full mt-3 p-3 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
            isNuancedAxis
              ? 'border-brand-primary/30 bg-brand-primary/[0.02] hover:border-brand-primary/50 hover:bg-brand-primary/[0.04]'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${disabled || confirmed ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <MessageSquareText className={`h-4 w-4 ${
            isNuancedAxis ? 'text-brand-primary/60' : 'text-gray-400'
          }`} />
          <span className={`text-[13px] font-medium ${
            isNuancedAxis ? 'text-brand-primary/70' : 'text-gray-500'
          }`}>
            None of these fit — tell us in your own words
          </span>
        </button>

        {isNuancedAxis && (
          <p className="text-[11px] text-gray-400 text-center mt-1.5 px-4">
            This topic has a lot of nuance. Feel free to explain your view.
          </p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 safe-area-bottom">
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
  );
}
