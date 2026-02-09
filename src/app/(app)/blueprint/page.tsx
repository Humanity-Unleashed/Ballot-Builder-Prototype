'use client';

/**
 * Blueprint Page - Schwartz Values-Based Civic Blueprint
 *
 * Manages three states:
 *   1. not_started  - Shows intro screen
 *   2. assessment   - Pick-one vignette scenarios
 *   3. complete     - Spider chart results view (civic blueprint)
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  useSchwartzStore,
  selectHasHydrated,
  selectSpec,
  selectIsSpecLoading,
  selectSpecError,
  selectHasCompletedAssessment,
  selectValueScores,
  selectDimensionScores,
} from '@/stores/schwartzStore';
import { schwartzApi, type SchwartzVignette } from '@/services/api';

import { useFeedbackScreen } from '@/context/FeedbackScreenContext';
import ValuesIntro from '@/components/schwartz/ValuesIntro';
import VignetteQuestion from '@/components/schwartz/VignetteQuestion';
import ValuesResults from '@/components/schwartz/ValuesResults';

type ValuesState = 'not_started' | 'assessment' | 'complete';

export default function ValuesPage() {
  // Store state
  const hasHydrated = useSchwartzStore(selectHasHydrated);
  const spec = useSchwartzStore(selectSpec);
  const isSpecLoading = useSchwartzStore(selectIsSpecLoading);
  const specError = useSchwartzStore(selectSpecError);
  const hasCompletedAssessment = useSchwartzStore(selectHasCompletedAssessment);
  const valueScores = useSchwartzStore(selectValueScores);
  const dimensionScores = useSchwartzStore(selectDimensionScores);

  // Store actions
  const loadSpec = useSchwartzStore((s) => s.loadSpec);
  const recordResponse = useSchwartzStore((s) => s.recordResponse);
  const clearResponses = useSchwartzStore((s) => s.clearResponses);
  const submitAndScore = useSchwartzStore((s) => s.submitAndScore);

  // Local state
  const [pageState, setPageState] = useState<ValuesState>('not_started');
  const [vignettes, setVignettes] = useState<SchwartzVignette[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localResponses, setLocalResponses] = useState<Record<string, string>>({}); // vignette_id → option_id
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feedback screen context
  const { setScreenLabel } = useFeedbackScreen();

  useEffect(() => {
    if (pageState === 'not_started') {
      setScreenLabel('Blueprint - Intro');
    } else if (pageState === 'assessment') {
      setScreenLabel(`Blueprint - Assessment (Q${currentIndex + 1}/${vignettes.length || '?'})`);
    } else if (pageState === 'complete') {
      setScreenLabel('Blueprint - Results');
    }
  }, [pageState, currentIndex, vignettes.length, setScreenLabel]);

  // Load spec on mount
  useEffect(() => {
    loadSpec();
  }, [loadSpec]);

  // Check if user has already completed assessment
  useEffect(() => {
    if (!hasHydrated || !spec) return;
    if (hasCompletedAssessment && valueScores.length > 0 && pageState === 'not_started') {
      setPageState('complete');
    }
  }, [hasHydrated, spec, hasCompletedAssessment, valueScores, pageState]);

  // Current vignette
  const currentVignette = vignettes[currentIndex];
  const currentSelection = currentVignette ? localResponses[currentVignette.id] ?? null : null;

  // Start assessment
  const handleStart = async () => {
    try {
      setError(null);
      clearResponses(); // clear any stale store data (e.g. old Likert responses)
      const { vignettes: fetched } = await schwartzApi.getVignettes(true);
      setVignettes(fetched);
      setCurrentIndex(0);
      setLocalResponses({});
      setPageState('assessment');
    } catch (err) {
      console.error('Failed to load vignettes:', err);
      setError('Failed to load assessment scenarios. Please try again.');
    }
  };

  // Record a vignette pick
  const handleSelect = (optionId: string) => {
    if (!currentVignette) return;
    setLocalResponses((prev) => ({
      ...prev,
      [currentVignette.id]: optionId,
    }));
    // Also record to store for persistence
    recordResponse({ vignette_id: currentVignette.id, selected_option_id: optionId });
  };

  // Navigate to next question or submit
  const handleNext = async () => {
    if (currentIndex >= vignettes.length - 1) {
      // Submit and score
      setIsSubmitting(true);
      try {
        await submitAndScore();
        setPageState('complete');
      } catch (err) {
        console.error('Failed to submit:', err);
        setError('Failed to calculate results. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Navigate back
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Retake assessment
  const handleRetake = () => {
    clearResponses();
    setVignettes([]);
    setCurrentIndex(0);
    setLocalResponses({});
    setPageState('not_started');
  };

  // Loading state
  if (!hasHydrated || isSpecLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
        <p className="mt-3 text-gray-500">Loading...</p>
      </div>
    );
  }

  // Error state
  if (specError || error || !spec) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50 p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-3 text-center text-gray-600">
          {specError || error || 'Failed to load assessment'}
        </p>
        <button
          className="mt-4 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          onClick={() => {
            setError(null);
            loadSpec();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Intro screen
  if (pageState === 'not_started') {
    return <ValuesIntro onStart={handleStart} />;
  }

  // Assessment flow
  if (pageState === 'assessment') {
    if (isSubmitting) {
      return (
        <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
          <p className="mt-3 text-gray-500">Calculating your results...</p>
        </div>
      );
    }

    if (!currentVignette) {
      return (
        <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
          <p className="text-gray-500">No scenarios available</p>
        </div>
      );
    }

    return (
      <VignetteQuestion
        vignette={currentVignette}
        currentIndex={currentIndex}
        totalVignettes={vignettes.length}
        selectedOptionId={currentSelection}
        onSelect={handleSelect}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentIndex > 0}
        isLast={currentIndex >= vignettes.length - 1}
      />
    );
  }

  // Results view
  if (pageState === 'complete') {
    return (
      <ValuesResults
        spec={spec}
        valueScores={valueScores}
        dimensionScores={dimensionScores}
        onRetake={handleRetake}
      />
    );
  }

  return null;
}
