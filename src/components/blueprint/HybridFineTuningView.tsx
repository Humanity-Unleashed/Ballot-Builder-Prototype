'use client';

/**
 * HybridFineTuningView — Replaces the old slider-based FineTuningScreen
 * with the same card + voice/NLP modality used in the main assessment.
 *
 * Scoped to one axis's sub-dimensions (from fineTuningPositions.ts).
 * Uses CardQuestion for structured input, NlpPanel for voice/text,
 * and SignalReviewCard for confirming NLP extraction.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  getFineTuningConfig,
  type SubDimension,
} from '@/data/fineTuningPositions';
import type { AxisSliderConfig, SliderPosition } from '@/data/sliderPositions';
import type { Spec } from '@/types/civicAssessment';
import type { ValueSignal } from '@/types/conversation';
import type { ClassifiedSignal } from '@/types/hybridAssessment';
import { classifySignals } from '@/lib/multiAxisExtraction';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

import CardQuestion from '@/components/assessment/CardQuestion';
import NlpPanel from '@/components/assessment/NlpPanel';
import SignalReviewCard from '@/components/assessment/SignalReviewCard';

// ── Types ──

type ViewMode = 'card' | 'nlp' | 'signal-review';

interface SignalReviewState {
  userText: string;
  classified: ClassifiedSignal[];
  extractedScore: number;
}

interface HybridFineTuningViewProps {
  axisId: string;
  spec: Spec;
  existingResponses: Record<string, number>;
  onComplete: (responses: Record<string, number>) => void;
  onCancel: () => void;
}

// ── Helpers ──

/** Convert a SubDimension to an AxisSliderConfig for CardQuestion/NlpPanel */
function subDimensionToAxisConfig(sub: SubDimension): AxisSliderConfig {
  const positions: SliderPosition[] = sub.positions.map((p) => ({
    title: p.title,
    description: p.description,
    isCurrentPolicy: p.isCurrentPolicy,
    // Sub-dimensions don't have tradeoffs yet — could be added later
  }));

  return {
    axisId: sub.id,
    question: sub.question,
    poleALabel: sub.poleALabel,
    poleBLabel: sub.poleBLabel,
    positions,
    currentPolicyIndex: sub.currentPolicyIndex,
  };
}

/** Convert a continuous 0-10 score to the nearest position index */
function scoreToPositionIndex(score: number, positionCount: number): number {
  const normalized = score / 10; // 0-1
  const index = Math.round(normalized * (positionCount - 1));
  return Math.max(0, Math.min(positionCount - 1, index));
}

// ── Component ──

export default function HybridFineTuningView({
  axisId,
  spec,
  existingResponses,
  onComplete,
  onCancel,
}: HybridFineTuningViewProps) {
  const { track } = useAnalyticsContext();
  const fineTuningConfig = getFineTuningConfig(axisId);
  const axis = spec.axes.find((a) => a.id === axisId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>(existingResponses);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalReview, setSignalReview] = useState<SignalReviewState | null>(null);

  if (!fineTuningConfig || !axis) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-gray-50">
        <p className="text-gray-500">Fine-tuning data not available for this topic.</p>
      </div>
    );
  }

  const subDimensions = fineTuningConfig.subDimensions;
  const currentSub = subDimensions[currentIndex];
  const totalQuestions = subDimensions.length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  const currentAxisConfig = subDimensionToAxisConfig(currentSub);

  // ── Advance to next sub-dimension (or complete) ──

  const advance = useCallback(
    (positionIndex: number) => {
      const newResponses = { ...responses, [currentSub.id]: positionIndex };
      setResponses(newResponses);

      if (currentIndex >= totalQuestions - 1) {
        track('click', { element: 'finetune_finish', axisId });
        onComplete(newResponses);
      } else {
        track('click', { element: 'finetune_next', axisId, questionIndex: currentIndex });
        setCurrentIndex(currentIndex + 1);
        setViewMode('card');
        setSignalReview(null);
        setError(null);
      }
    },
    [responses, currentSub.id, currentIndex, totalQuestions, axisId, onComplete, track],
  );

  // ── Structured card selection ──

  const handleCardSelect = useCallback(
    (value: number, _dwellTimeMs: number) => {
      // Convert 0-10 card value to position index
      const positionIndex = scoreToPositionIndex(value, currentSub.positions.length);
      advance(positionIndex);
    },
    [currentSub.positions.length, advance],
  );

  // ── Escape hatch — switch to NLP ──

  const handleEscapeHatch = useCallback(() => {
    setViewMode('nlp');
  }, []);

  // ── Show cards (back from NLP) ──

  const handleShowCards = useCallback(() => {
    setViewMode('card');
    setSignalReview(null);
    setError(null);
  }, []);

  // ── NLP submission ──

  const handleNlpSubmit = useCallback(
    async (text: string) => {
      setIsExtracting(true);
      setError(null);

      try {
        const response = await fetch('/api/assessment/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            askedAxis: currentSub.parentAxisId,
            userInput: text,
            answeredAxes: [],
            currentProfile: {},
            // Provide sub-dimension context for better extraction
            refinementContext: {
              subDimension: currentSub.name,
              question: currentSub.question,
              poleA: currentSub.poleALabel,
              poleB: currentSub.poleBLabel,
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Extraction failed');
        }

        const data: {
          signals: ValueSignal[];
          meta: { askedAxis: string; axesCovered: string[]; overallClarity: number };
        } = await response.json();

        // Classify — only care about primary signal for the parent axis
        const classified = classifySignals(currentSub.parentAxisId, data.signals);
        const primarySignal = classified.find((s) => s.strength === 'primary');

        if (primarySignal) {
          const extractedScore = primarySignal.rawSignal.direction;
          setSignalReview({
            userText: text,
            classified,
            extractedScore,
          });
          setViewMode('signal-review');
        } else {
          // No clear signal — go back to cards
          setError('Could not determine a clear position. Try the cards instead.');
          setViewMode('card');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsExtracting(false);
      }
    },
    [currentSub],
  );

  // ── Signal review: accept ──

  const handleSignalAccept = useCallback(() => {
    if (!signalReview) return;
    const positionIndex = scoreToPositionIndex(
      signalReview.extractedScore,
      currentSub.positions.length,
    );
    advance(positionIndex);
  }, [signalReview, currentSub.positions.length, advance]);

  // ── Signal review: refine (go back to NLP) ──

  const handleSignalRefine = useCallback(() => {
    setViewMode('nlp');
    setSignalReview(null);
  }, []);

  // ── Skip ──

  const handleSkip = useCallback(() => {
    track('click', { element: 'finetune_skip', axisId, questionIndex: currentIndex });
    // Use middle position as default
    const middleIndex = Math.floor(currentSub.positions.length / 2);
    advance(middleIndex);
  }, [currentSub.positions.length, advance, track, axisId, currentIndex]);

  // ── Render ──

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="mb-4 flex items-center">
          <button
            onClick={() => {
              track('click', { element: 'finetune_cancel', axisId });
              onCancel();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <span className="block text-xs font-semibold uppercase tracking-wide text-brand-primary">
              Fine-tuning
            </span>
            <span className="mt-0.5 block text-base font-bold text-gray-900">
              {axis.name}
            </span>
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
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Signal review view */}
        {viewMode === 'signal-review' && signalReview && (
          <div className="flex-1 overflow-y-auto flex items-start justify-center pt-4 px-4">
            <SignalReviewCard
              userText={signalReview.userText}
              signals={signalReview.classified}
              onAccept={handleSignalAccept}
              onRefine={handleSignalRefine}
            />
          </div>
        )}

        {/* NLP panel view */}
        {viewMode === 'nlp' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <NlpPanel
              axisConfig={currentAxisConfig}
              onSubmit={handleNlpSubmit}
              onShowCards={handleShowCards}
              isExtracting={isExtracting}
            />
          </div>
        )}

        {/* Card question view (default) */}
        {viewMode === 'card' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <CardQuestion
              key={currentSub.id}
              axisConfig={currentAxisConfig}
              isNuancedAxis={false}
              onSelect={handleCardSelect}
              onEscapeHatch={handleEscapeHatch}
              onSkip={handleSkip}
            />
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
