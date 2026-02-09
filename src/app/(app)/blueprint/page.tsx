'use client';

/**
 * Blueprint Page - Schwartz Values-Based Civic Blueprint
 *
 * Manages three states:
 *   1. not_started  - Shows intro screen
 *   2. assessment   - 5-point Likert questions
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
import { schwartzApi, type SchwartzAssessmentItem } from '@/services/api';

import ValuesIntro from '@/components/schwartz/ValuesIntro';
import AssessmentQuestion from '@/components/schwartz/AssessmentQuestion';
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
  const [items, setItems] = useState<SchwartzAssessmentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localResponses, setLocalResponses] = useState<Record<string, 1 | 2 | 3 | 4 | 5>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Current item
  const currentItem = items[currentIndex];
  const currentValue = currentItem ? localResponses[currentItem.id] ?? null : null;

  // Start assessment
  const handleStart = async () => {
    try {
      setError(null);
      const { items: fetchedItems } = await schwartzApi.getItems(true);
      setItems(fetchedItems);
      setCurrentIndex(0);
      setLocalResponses({});
      setPageState('assessment');
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load assessment questions. Please try again.');
    }
  };

  // Record response and optionally advance
  const handleResponse = (value: 1 | 2 | 3 | 4 | 5) => {
    if (!currentItem) return;
    setLocalResponses((prev) => ({
      ...prev,
      [currentItem.id]: value,
    }));
    // Also record to store for persistence
    recordResponse({ item_id: currentItem.id, response: value });
  };

  // Navigate to next question or submit
  const handleNext = async () => {
    if (currentIndex >= items.length - 1) {
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
    setItems([]);
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
    return <ValuesIntro onStart={handleStart} itemCount={spec.items.length} />;
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

    if (!currentItem) {
      return (
        <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
          <p className="text-gray-500">No questions available</p>
        </div>
      );
    }

    return (
      <AssessmentQuestion
        item={currentItem}
        currentIndex={currentIndex}
        totalItems={items.length}
        currentValue={currentValue}
        onResponse={handleResponse}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentIndex > 0}
        isLast={currentIndex >= items.length - 1}
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
