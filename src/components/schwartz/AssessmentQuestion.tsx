'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LikertScale from './LikertScale';
import type { SchwartzAssessmentItem } from '@/services/api';

interface AssessmentQuestionProps {
  item: SchwartzAssessmentItem;
  currentIndex: number;
  totalItems: number;
  currentValue: 1 | 2 | 3 | 4 | 5 | null;
  onResponse: (value: 1 | 2 | 3 | 4 | 5) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLast: boolean;
}

export default function AssessmentQuestion({
  item,
  currentIndex,
  totalItems,
  currentValue,
  onResponse,
  onNext,
  onBack,
  canGoBack,
  isLast,
}: AssessmentQuestionProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [prevItemId, setPrevItemId] = useState(item.id);

  // Reset fade when item changes (React-recommended derived state pattern)
  if (prevItemId !== item.id) {
    setPrevItemId(item.id);
    setFadeIn(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [item.id]);

  const progress = ((currentIndex + 1) / totalItems) * 100;

  const handleResponse = (value: 1 | 2 | 3 | 4 | 5) => {
    onResponse(value);
  };

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
            Question {currentIndex + 1} of {totalItems}
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div
          className={`w-full max-w-lg transition-all duration-300 ${
            fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Statement */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-center text-lg font-medium text-gray-900">
              &ldquo;{item.text}&rdquo;
            </p>
          </div>

          {/* Likert scale */}
          <LikertScale value={currentValue} onChange={handleResponse} />
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
            disabled={currentValue === null}
            className={`flex items-center gap-1 rounded-lg px-6 py-3 font-medium transition-all ${
              currentValue !== null
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
