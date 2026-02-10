'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SchwartzVignette } from '@/services/api';

interface VignetteQuestionProps {
  vignette: SchwartzVignette;
  currentIndex: number;
  totalVignettes: number;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLast: boolean;
}

export default function VignetteQuestion({
  vignette,
  currentIndex,
  totalVignettes,
  selectedOptionId,
  onSelect,
  onNext,
  onBack,
  canGoBack,
  isLast,
}: VignetteQuestionProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [prevId, setPrevId] = useState(vignette.id);

  // Reset fade when vignette changes
  if (prevId !== vignette.id) {
    setPrevId(vignette.id);
    setFadeIn(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [vignette.id]);

  const progress = ((currentIndex + 1) / totalVignettes) * 100;

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gray-50">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="h-1 w-full bg-gray-200">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="px-4 py-3">
          <p className="text-center text-sm text-gray-500">
            Scenario {currentIndex + 1} of {totalVignettes}
          </p>
        </div>
      </div>

      {/* Scenario + Options */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div
          className={`w-full max-w-lg transition-all duration-300 ${
            fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Scenario card */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-center text-lg font-medium text-gray-900">
              {vignette.scenario}
            </p>
          </div>

          {/* Option buttons */}
          <div className="space-y-3">
            {vignette.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={`w-full rounded-xl border-2 px-5 py-4 text-left text-[15px] leading-snug transition-all ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50 text-violet-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`flex items-center gap-1 rounded-lg px-4 py-3 font-medium transition-all ${
              canGoBack
                ? 'text-gray-700 hover:bg-gray-100'
                : 'cursor-not-allowed text-gray-300'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <button
            onClick={onNext}
            disabled={selectedOptionId === null}
            className={`flex items-center gap-1 rounded-lg px-6 py-3 font-medium transition-all ${
              selectedOptionId !== null
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            <span>{isLast ? 'See Results' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
