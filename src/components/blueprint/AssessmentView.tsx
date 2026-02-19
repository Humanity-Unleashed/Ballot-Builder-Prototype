'use client';

import React from 'react';
import { getSliderConfig } from '@/data/sliderPositions';
import type { Spec } from '@/types/civicAssessment';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import ImportanceSlider from './ImportanceSlider';

interface AssessmentViewProps {
  spec: Spec;
  axisQueue: string[];
  currentAxisIndex: number;
  sliderPosition: number;
  currentStrength: number;
  fadeVisible: boolean;
  onSliderChange: (pos: number) => void;
  onStrengthChange: (val: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AssessmentView({
  spec,
  axisQueue,
  currentAxisIndex,
  sliderPosition,
  currentStrength,
  fadeVisible,
  onSliderChange,
  onStrengthChange,
  onNext,
  onBack,
}: AssessmentViewProps) {
  const { track } = useAnalyticsContext();

  const currentAxisId = axisQueue[currentAxisIndex];
  const currentAxisConfig = currentAxisId ? getSliderConfig(currentAxisId) : null;
  const currentAxis = currentAxisId ? spec.axes.find((a) => a.id === currentAxisId) : null;

  if (!currentAxisConfig || !currentAxis) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalAxes = axisQueue.length;
  const progressPercentage = totalAxes > 0 ? (currentAxisIndex / totalAxes) * 100 : 0;

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gray-50">
      {/* Progress header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Question {currentAxisIndex + 1} of {totalAxes}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#8B7AAF] transition-[width] duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question + options (scrollable region) */}
      <div className="flex-1 overflow-y-auto p-5 pb-10">
        <div
          className="transition-opacity duration-200"
          style={{ opacity: fadeVisible ? 1 : 0 }}
        >
          <p className="mb-4 text-base font-semibold leading-relaxed text-gray-800">
            {currentAxisConfig.question}
          </p>

          {/* All position options as tappable cards */}
          <div className="flex flex-col gap-2.5">
            {currentAxisConfig.positions.map((position, index) => {
              const isSelected = index === sliderPosition;
              return (
                <button
                  key={index}
                  onClick={() => onSliderChange(index)}
                  className={[
                    'w-full rounded-xl border-2 px-4 py-3 text-left transition-colors',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary-light'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ].join(' ')}
                >
                  <p className={[
                    'text-[14px] font-semibold',
                    isSelected ? 'text-brand-primary' : 'text-gray-700',
                  ].join(' ')}>
                    {position.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-[19px] text-gray-500">
                    {position.description}
                  </p>
                  {position.isCurrentPolicy && (
                    <span className="mt-1.5 inline-block rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Current US Policy
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Importance slider */}
          <ImportanceSlider value={currentStrength} onChange={onStrengthChange} />
        </div>
      </div>

      {/* Navigation footer (sticky) */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-5">
        <div className="flex gap-3">
          <button
            onClick={() => { track('click', { element: 'assessment_back', questionIndex: currentAxisIndex }); onBack(); }}
            disabled={currentAxisIndex === 0}
            className={[
              'flex-1 rounded-xl py-3.5 text-[15px] font-semibold transition-colors',
              currentAxisIndex === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            Back
          </button>
          <button
            onClick={() => { track('click', { element: currentAxisIndex >= axisQueue.length - 1 ? 'assessment_finish' : 'assessment_next', questionIndex: currentAxisIndex }); onNext(); }}
            className="flex-1 rounded-xl bg-brand-primary py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {currentAxisIndex >= axisQueue.length - 1 ? 'Finish' : 'Next \u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
