'use client';

import React from 'react';
import { Lightbulb, Check } from 'lucide-react';
import { getSliderConfig } from '@/data/sliderPositions';
import type { Spec } from '@/types/civicAssessment';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import StrengthChips from './StrengthChips';

interface AssessmentViewProps {
  spec: Spec;
  axisQueue: string[];
  currentAxisIndex: number;
  sliderPosition: number;
  currentStrength: number;
  fadeVisible: boolean;
  showTransition: boolean;
  transitionMessage: string;
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
  showTransition,
  transitionMessage,
  onSliderChange,
  onStrengthChange,
  onNext,
  onBack,
}: AssessmentViewProps) {
  const { track } = useAnalyticsContext();

  // Transition interstitial
  if (showTransition) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50 p-6">
        <Lightbulb className="h-16 w-16 text-brand-primary" />
        <p className="mt-4 text-center text-lg font-semibold text-gray-700">
          {transitionMessage}
        </p>
      </div>
    );
  }

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

      {/* Question card (scrollable region) */}
      <div className="flex-1 overflow-y-auto p-5 pb-10">
        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-200"
          style={{ opacity: fadeVisible ? 1 : 0 }}
        >
          {currentAxisIndex === 0 && (
            <div className="mb-4 rounded-lg bg-brand-primary-light px-4 py-3 text-[13px] leading-5 text-gray-600">
              <span className="font-semibold text-gray-700">Here&apos;s how it works: </span>
              Tap the policy position closest to your view. Then tell us{' '}
              <span className="font-semibold">how important</span> this issue is to you by picking
              one of the buttons below. There are no right or wrong answers.
            </div>
          )}

          <p className="mb-4 text-base font-semibold leading-relaxed text-gray-800">{currentAxisConfig.question}</p>

          {/* All positions as tappable options */}
          <div className="mb-5 space-y-2">
            {currentAxisConfig.positions.map((position, index) => {
              const isSelected = sliderPosition === index;
              return (
                <button
                  key={index}
                  onClick={() => onSliderChange(index)}
                  className={[
                    'w-full rounded-xl border-2 p-3 text-left transition-all',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary-light/60'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={[
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isSelected
                          ? 'border-brand-primary bg-brand-primary'
                          : 'border-gray-300 bg-white',
                      ].join(' ')}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={[
                        'text-[14px] leading-tight',
                        isSelected ? 'text-gray-800' : 'text-gray-700',
                      ].join(' ')}>
                        {position.description}
                      </p>
                      {position.isCurrentPolicy && (
                        <span className="mt-1.5 inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                          Current US Policy
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Strength chips */}
          <StrengthChips selectedValue={currentStrength} onSelect={onStrengthChange} />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 bg-white p-5">
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
