'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import { getSliderConfig } from '@/data/sliderPositions';
import type { Spec } from '@/types/civicAssessment';
import DomainLeanMeter from './DomainLeanMeter';
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
  // Transition interstitial
  if (showTransition) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50 p-6">
        <Lightbulb className="h-16 w-16 text-violet-600" />
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
  const currentPosition = currentAxisConfig.positions[sliderPosition];
  const totalPositions = currentAxisConfig.positions.length;

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
          <p className="mb-5 text-sm leading-5 text-gray-600">{currentAxisConfig.question}</p>

          {/* Position display */}
          <div className="mb-5 rounded-xl border-2 border-violet-200 bg-violet-50/40 p-4">
            <p className="text-[15px] font-semibold text-gray-900">{currentPosition.title}</p>
            <p className="mt-1 text-[13px] leading-[19px] text-gray-600">
              {currentPosition.description}
            </p>
            {currentPosition.isCurrentPolicy && (
              <span className="mt-2 inline-block rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Current US Policy
              </span>
            )}
          </div>

          {/* Slider */}
          <DomainLeanMeter
            value={(sliderPosition / (totalPositions - 1)) * 100}
            leftLabel={currentAxisConfig.poleALabel.replace(/\n/g, ' ')}
            rightLabel={currentAxisConfig.poleBLabel.replace(/\n/g, ' ')}
            onChange={(v) => onSliderChange(Math.round((v / 100) * (totalPositions - 1)))}
          />

          {/* Strength chips */}
          <StrengthChips selectedValue={currentStrength} onSelect={onStrengthChange} />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 bg-white p-5">
        <div className="flex gap-3">
          <button
            onClick={onBack}
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
            onClick={onNext}
            className="flex-1 rounded-xl bg-violet-600 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {currentAxisIndex >= axisQueue.length - 1 ? 'Finish' : 'Next \u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
