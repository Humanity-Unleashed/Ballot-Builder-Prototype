'use client';

/**
 * Blueprint Page - State Machine Orchestrator
 *
 * Manages four states:
 *   1. not_started  - Shows intro with "Draft Your Civic Blueprint"
 *   2. assessment   - Adaptive assessment questions with slider
 *   3. complete     - Editable blueprint view with retake option
 *   4. fine_tuning  - Drill-down fine-tuning flow for a single axis
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useBlueprint } from '@/context/BlueprintContext';
import { useUserStore, selectHasHydrated } from '@/stores/userStore';
import { civicAxesApi } from '@/services/api';
import type { SwipeEvent, AxisScore } from '@/services/api';
import type { Spec } from '@/types/civicAssessment';
import { deriveMetaDimensions } from '@/lib/archetypes';
import { getSliderConfig } from '@/data/sliderPositions';
import {
  getAxesForDomains,
  checkForAxisTransition,
  convertResponsesToSwipes,
  DEFAULT_STRENGTH_VALUE,
} from '@/lib/blueprintHelpers';

import IntroScreen from '@/components/blueprint/IntroScreen';
import AssessmentView from '@/components/blueprint/AssessmentView';
import BlueprintView from '@/components/blueprint/BlueprintView';
import FineTuningScreen from '@/components/blueprint/FineTuningScreen';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type BlueprintState = 'not_started' | 'assessment' | 'complete' | 'fine_tuning';

// ────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────
export default function BlueprintPage() {
  const {
    profile,
    spec: blueprintSpec,
    isLoading: blueprintLoading,
    initializeFromSwipes,
    applySliderValues,
    updateAxisValue,
    updateAxisImportance,
  } = useBlueprint();

  const hasHydrated = useUserStore(selectHasHydrated);

  // Spec + loading
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State machine
  const [blueprintState, setBlueprintState] = useState<BlueprintState>('not_started');

  // Assessment state
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [axisQueue, setAxisQueue] = useState<string[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(2);
  const [axisResponses, setAxisResponses] = useState<Record<string, number>>({});
  const [axisImportances, setAxisImportances] = useState<Record<string, number>>({});
  const [currentStrength, setCurrentStrength] = useState(DEFAULT_STRENGTH_VALUE);
  const [swipes, setSwipes] = useState<SwipeEvent[]>([]);
  const [fadeVisible, setFadeVisible] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Fine-tuning state
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);
  const [fineTuningResponses, setFineTuningResponses] = useState<
    Record<string, Record<string, number>>
  >({});

  // ────────────────────────────────────────
  // Derived data
  // ────────────────────────────────────────
  const metaDimensions = useMemo(() => {
    if (!profile) return null;
    return deriveMetaDimensions(profile);
  }, [profile]);

  // ────────────────────────────────────────
  // Fetch spec on mount
  // ────────────────────────────────────────
  // Fetch spec on mount (runs once)
  useEffect(() => {
    async function fetchSpec() {
      try {
        setLoading(true);
        const fetchedSpec = await civicAxesApi.getSpec();
        setSpec(fetchedSpec);
        setSelectedDomains(new Set(fetchedSpec.domains.map((d) => d.id)));
        setError(null);
      } catch (err) {
        console.error('Failed to load civic axes spec:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSpec();
  }, []);

  // Check if user has completed profile and set state accordingly
  // This runs after spec loads and whenever profile changes
  useEffect(() => {
    if (!spec) return; // Wait for spec to load first
    if (profile && profile.domains && profile.domains.length > 0) {
      const hasSetAxes = profile.domains.some((d) =>
        d.axes.some((a) => a.source !== 'default'),
      );
      if (hasSetAxes && blueprintState === 'not_started') {
        setBlueprintState('complete');
      }
    }
  }, [profile, spec, blueprintState]);

  // ────────────────────────────────────────
  // Helpers for the assessment flow
  // ────────────────────────────────────────
  const calculateScores = async (swipeList: SwipeEvent[]) => {
    try {
      const response = await civicAxesApi.scoreResponses(swipeList);
      const scoresRecord: Record<string, AxisScore> = {};
      response.scores.forEach((score) => {
        scoresRecord[score.axis_id] = score;
      });
      return scoresRecord;
    } catch (err) {
      console.error('Failed to calculate scores:', err);
      return {};
    }
  };

  const animateTransition = useCallback(
    (callback: () => void, delay?: number) => {
      setFadeVisible(false);
      const run = () => {
        callback();
        setFadeVisible(true);
      };
      if (delay) {
        setTimeout(run, delay);
      } else {
        setTimeout(run, 200);
      }
    },
    [],
  );

  // ────────────────────────────────────────
  // Assessment actions
  // ────────────────────────────────────────
  const startAssessment = (domains: Set<string>) => {
    if (!spec) return;
    setSelectedDomains(domains);
    const axes = getAxesForDomains(spec, domains);
    setAxisQueue(axes);
    setCurrentAxisIndex(0);
    setSliderPosition(2);
    setAxisResponses({});
    setAxisImportances({});
    setCurrentStrength(DEFAULT_STRENGTH_VALUE);
    setBlueprintState('assessment');
  };

  const finishAssessment = async (
    newResponses: Record<string, number>,
    newImportances: Record<string, number>,
  ) => {
    const finalSwipes = convertResponsesToSwipes(newResponses, spec!);
    setSwipes(finalSwipes);
    await calculateScores(finalSwipes);
    await initializeFromSwipes(finalSwipes);
    // Apply slider positions directly as axis values (bypasses Bayesian shrinkage
    // which washes out values with only 2 items per axis)
    applySliderValues(newResponses, newImportances);
    setBlueprintState('complete');
  };

  const handleNext = () => {
    const currentAxisId = axisQueue[currentAxisIndex];
    const currentAxisConfig = currentAxisId ? getSliderConfig(currentAxisId) : null;
    if (!currentAxisId || !currentAxisConfig) return;

    const newResponses = { ...axisResponses, [currentAxisId]: sliderPosition };
    setAxisResponses(newResponses);

    const newImportances = { ...axisImportances, [currentAxisId]: currentStrength };
    setAxisImportances(newImportances);

    animateTransition(async () => {
      if (currentAxisIndex >= axisQueue.length - 1) {
        await finishAssessment(newResponses, newImportances);
        return;
      }

      const nextIndex = currentAxisIndex + 1;
      const nextAxisId = axisQueue[nextIndex];
      const transMsg = checkForAxisTransition(nextIndex, axisQueue.length);

      if (transMsg) {
        setTransitionMessage(transMsg);
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setCurrentAxisIndex(nextIndex);
          setSliderPosition(2);
          setCurrentStrength(newImportances[nextAxisId] ?? DEFAULT_STRENGTH_VALUE);
        }, 1500);
      } else {
        setCurrentAxisIndex(nextIndex);
        setSliderPosition(2);
        setCurrentStrength(newImportances[nextAxisId] ?? DEFAULT_STRENGTH_VALUE);
      }
    });
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      animateTransition(() => {
        const prevIndex = currentAxisIndex - 1;
        const prevAxisId = axisQueue[prevIndex];
        setCurrentAxisIndex(prevIndex);
        setSliderPosition(axisResponses[prevAxisId] ?? 2);
        setCurrentStrength(axisImportances[prevAxisId] ?? DEFAULT_STRENGTH_VALUE);
      });
    }
  };

  const handleRetake = () => {
    setSwipes([]);
    setAxisResponses({});
    setAxisImportances({});
    setCurrentStrength(DEFAULT_STRENGTH_VALUE);
    setAxisQueue([]);
    setCurrentAxisIndex(0);
    setSliderPosition(2);
    setFineTuningResponses({});
    setFineTuningAxisId(null);
    // Reset profile so the "has completed" effect doesn't snap back to 'complete'
    useUserStore.getState().setBlueprintProfile(null);
    setBlueprintState('not_started');
  };

  // ────────────────────────────────────────
  // Loading & error states
  // ────────────────────────────────────────
  if (loading || blueprintLoading || !hasHydrated) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
        <p className="mt-3 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50 p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-3 text-center text-gray-600">{error || 'Failed to load assessment'}</p>
        <button
          className="mt-4 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          onClick={async () => {
            try {
              setLoading(true);
              setError(null);
              const fetchedSpec = await civicAxesApi.getSpec();
              setSpec(fetchedSpec);
              setSelectedDomains(new Set(fetchedSpec.domains.map((d) => d.id)));
            } catch {
              setError('Failed to load assessment data. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ────────────────────────────────────────
  // STATE 1: Not Started
  // ────────────────────────────────────────
  if (blueprintState === 'not_started') {
    return (
      <IntroScreen
        spec={spec}
        onStart={() => startAssessment(new Set(spec.domains.map((d) => d.id)))}
      />
    );
  }

  // ────────────────────────────────────────
  // STATE 2: Assessment
  // ────────────────────────────────────────
  if (blueprintState === 'assessment') {
    return (
      <AssessmentView
        spec={spec}
        axisQueue={axisQueue}
        currentAxisIndex={currentAxisIndex}
        sliderPosition={sliderPosition}
        currentStrength={currentStrength}
        fadeVisible={fadeVisible}
        showTransition={showTransition}
        transitionMessage={transitionMessage}
        onSliderChange={setSliderPosition}
        onStrengthChange={setCurrentStrength}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  // ────────────────────────────────────────
  // STATE 2.5: Fine-Tuning
  // ────────────────────────────────────────
  if (blueprintState === 'fine_tuning' && fineTuningAxisId && spec) {
    return (
      <FineTuningScreen
        axisId={fineTuningAxisId}
        spec={spec}
        existingResponses={fineTuningResponses[fineTuningAxisId] || {}}
        onComplete={(responses) => {
          setFineTuningResponses((prev) => ({
            ...prev,
            [fineTuningAxisId]: responses,
          }));
          setFineTuningAxisId(null);
          setBlueprintState('complete');
        }}
        onCancel={() => {
          setFineTuningAxisId(null);
          setBlueprintState('complete');
        }}
      />
    );
  }

  // ────────────────────────────────────────
  // STATE 3: Complete
  // ────────────────────────────────────────
  if (!profile || !blueprintSpec) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
        <p className="mt-3 text-gray-500">Loading your blueprint...</p>
      </div>
    );
  }

  return (
    <BlueprintView
      profile={profile}
      blueprintSpec={blueprintSpec}
      metaDimensions={metaDimensions}
      fineTuningResponses={fineTuningResponses}
      onRetake={handleRetake}
      onEditingAxisChange={() => {}}
      onFineTune={(axisId) => {
        setFineTuningAxisId(axisId);
        setBlueprintState('fine_tuning');
      }}
      onChangeAxis={updateAxisValue}
      onChangeAxisImportance={updateAxisImportance}
    />
  );
}
