'use client';

import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { getFineTuningConfig } from '@/data/fineTuningPositions';
import type { Spec } from '@/types/civicAssessment';
import { DEFAULT_STRENGTH_VALUE } from '@/lib/blueprintHelpers';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import DomainLeanMeter from './DomainLeanMeter';
import StrengthChips from './StrengthChips';

interface FineTuningScreenProps {
  axisId: string;
  spec: Spec;
  existingResponses: Record<string, number>;
  onComplete: (responses: Record<string, number>) => void;
  onCancel: () => void;
}

export default function FineTuningScreen({
  axisId,
  spec,
  existingResponses,
  onComplete,
  onCancel,
}: FineTuningScreenProps) {
  const { track } = useAnalyticsContext();
  const fineTuningConfig = getFineTuningConfig(axisId);
  const axis = spec.axes.find((a) => a.id === axisId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(
    existingResponses[fineTuningConfig?.subDimensions[0]?.id || ''] ?? 2,
  );
  const [responses, setResponses] = useState<Record<string, number>>(existingResponses);
  const [strengthResponses, setStrengthResponses] = useState<Record<string, number>>({});
  const [currentStrength, setCurrentStrength] = useState(DEFAULT_STRENGTH_VALUE);
  const [fadeVisible, setFadeVisible] = useState(true);

  const animateTransition = useCallback(
    (callback: () => void) => {
      setFadeVisible(false);
      setTimeout(() => {
        callback();
        setFadeVisible(true);
      }, 200);
    },
    [],
  );

  if (!fineTuningConfig || !axis) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-gray-50">
        <p className="text-gray-500">Fine-tuning data not available</p>
      </div>
    );
  }

  const subDimensions = fineTuningConfig.subDimensions;
  const currentSubDimension = subDimensions[currentIndex];
  const totalQuestions = subDimensions.length;
  const progressPercentage = (currentIndex / totalQuestions) * 100;

  const currentPosition = currentSubDimension.positions[sliderPosition];
  const totalPositions = currentSubDimension.positions.length;

  const handleNext = () => {
    const isLast = currentIndex >= totalQuestions - 1;
    track('click', { element: isLast ? 'finetune_finish' : 'finetune_next', axisId, questionIndex: currentIndex });

    const newResponses = { ...responses, [currentSubDimension.id]: sliderPosition };
    setResponses(newResponses);

    const newStrength = { ...strengthResponses, [currentSubDimension.id]: currentStrength };
    setStrengthResponses(newStrength);

    animateTransition(() => {
      if (isLast) {
        onComplete(newResponses);
        return;
      }
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSliderPosition(newResponses[subDimensions[nextIndex].id] ?? 2);
      setCurrentStrength(newStrength[subDimensions[nextIndex].id] ?? DEFAULT_STRENGTH_VALUE);
    });
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateTransition(() => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setSliderPosition(responses[subDimensions[prevIndex].id] ?? 2);
        setCurrentStrength(
          strengthResponses[subDimensions[prevIndex].id] ?? DEFAULT_STRENGTH_VALUE,
        );
      });
    }
  };

  const handleSkip = () => {
    track('click', { element: 'finetune_skip', axisId, questionIndex: currentIndex });
    const newResponses = { ...responses, [currentSubDimension.id]: 2 };
    setResponses(newResponses);

    const newStrength = {
      ...strengthResponses,
      [currentSubDimension.id]: DEFAULT_STRENGTH_VALUE,
    };
    setStrengthResponses(newStrength);

    animateTransition(() => {
      if (currentIndex >= totalQuestions - 1) {
        onComplete(newResponses);
        return;
      }
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSliderPosition(newResponses[subDimensions[nextIndex].id] ?? 2);
      setCurrentStrength(newStrength[subDimensions[nextIndex].id] ?? DEFAULT_STRENGTH_VALUE);
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="mb-4 flex items-center">
          <button
            onClick={() => { track('click', { element: 'finetune_cancel', axisId }); onCancel(); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <span className="block text-xs font-semibold uppercase tracking-wide text-violet-600">
              Fine-tuning
            </span>
            <span className="mt-0.5 block text-base font-bold text-gray-900">{axis.name}</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="mt-2">
          <p className="mb-1.5 text-center text-xs text-gray-500">
            Sub-topic {currentIndex + 1} of {totalQuestions}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#8B7AAF] transition-[width] duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-5">
        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity duration-200"
          style={{ opacity: fadeVisible ? 1 : 0 }}
        >
          <h3 className="mb-2 text-base font-bold leading-6 text-gray-900">
            {currentSubDimension.name}
          </h3>
          <p className="mb-5 text-sm leading-[22px] text-gray-600">
            {currentSubDimension.question}
          </p>

          {/* Position card */}
          <div className="mb-5 min-h-[100px] rounded-xl border-2 border-violet-200 bg-violet-50/40 p-4">
            <p className="text-center text-[15px] font-semibold leading-[22px] text-gray-900">
              {currentPosition.title}
            </p>
            <p className="mt-2 text-center text-[13px] leading-5 text-gray-600">
              {currentPosition.description}
            </p>
            {currentPosition.isCurrentPolicy && (
              <div className="mt-3 flex justify-center">
                <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  Current US Policy
                </span>
              </div>
            )}
          </div>

          {/* Slider */}
          <DomainLeanMeter
            value={(sliderPosition / (totalPositions - 1)) * 100}
            leftLabel={currentSubDimension.poleALabel.replace(/\n/g, ' ')}
            rightLabel={currentSubDimension.poleBLabel.replace(/\n/g, ' ')}
            onChange={(v) => setSliderPosition(Math.round((v / 100) * (totalPositions - 1)))}
          />

          {/* Strength chips */}
          <StrengthChips selectedValue={currentStrength} onSelect={setCurrentStrength} />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 bg-white p-5">
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={[
              'flex-1 rounded-xl py-3.5 text-[15px] font-semibold transition-colors',
              currentIndex === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            ].join(' ')}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl bg-violet-600 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {currentIndex >= totalQuestions - 1 ? 'Finish' : 'Next \u2192'}
          </button>
        </div>
        <button
          onClick={handleSkip}
          className="mt-3 w-full text-center text-[13px] text-gray-400 transition-colors hover:text-gray-600"
        >
          Skip this sub-topic
        </button>
      </div>
    </div>
  );
}
