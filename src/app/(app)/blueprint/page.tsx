'use client';

/**
 * Blueprint Page - Slider-Based Civic Blueprint Assessment
 *
 * State machine: [intro/demographics] → assessment → [fine_tuning] → results
 * Onboarding modal overlays on first visit (persisted to localStorage)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

import { useBlueprint } from '@/context/BlueprintContext';
import { useFeedbackScreen } from '@/context/FeedbackScreenContext';
import { getSliderConfig } from '@/data/sliderPositions';
import { calculateFineTunedScore } from '@/data/fineTuningPositions';
import { deriveMetaDimensions } from '@/lib/archetypes';
import { transformBallot } from '@/lib/ballotHelpers';
import { DEFAULT_STRENGTH_VALUE } from '@/lib/blueprintHelpers';
import { useDemographicStore } from '@/stores/demographicStore';
import { ballotApi } from '@/services/api';

import DemographicScreen from '@/components/demographics/DemographicScreen';
import IntroScreen from '@/components/blueprint/IntroScreen';
import AssessmentView from '@/components/blueprint/AssessmentView';
import BlueprintSummaryView from '@/components/blueprint/BlueprintSummaryView';
import FineTuningScreen from '@/components/blueprint/FineTuningScreen';

const ONBOARDING_KEY = 'bb_onboarding_viewed';

type PageState = 'intro' | 'demographics' | 'assessment' | 'fine_tuning' | 'results';

export default function BlueprintPage() {
  const {
    spec,
    profile,
    isLoading,
    applySliderValues,
    updateAxisValue,
    updateAxisImportance,
    assessmentProgress,
    saveAssessmentProgress,
    clearAssessmentProgress,
    completeAssessment,
    resetBlueprint,
  } = useBlueprint();

  const { setScreenLabel } = useFeedbackScreen();
  const { reset: resetDemographics } = useDemographicStore();

  // ── Onboarding modal (first visit only) ──
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window !== 'undefined' && !localStorage.getItem(ONBOARDING_KEY),
  );

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // ── Page state machine ──
  const hasRealScores = profile?.domains.some((d) =>
    d.axes.some((a) => a.source !== 'default'),
  ) ?? false;
  const [pageState, setPageState] = useState<PageState>(() => {
    if (assessmentProgress) return 'assessment';
    if (hasRealScores) return 'results';
    return 'intro';
  });
  const isRetaking = useRef(false);

  // ── Assessment state (restored from saved progress if available) ──
  const [axisQueue, setAxisQueue] = useState<string[]>(
    () => assessmentProgress?.axisQueue ?? [],
  );
  const [currentAxisIndex, setCurrentAxisIndex] = useState(
    () => assessmentProgress?.currentAxisIndex ?? 0,
  );
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>(
    () => assessmentProgress?.sliderPositions ?? {},
  );
  const [strengthValues, setStrengthValues] = useState<Record<string, number>>(
    () => assessmentProgress?.strengthValues ?? {},
  );

  // ── Ballot-relevant axes (used to filter assessment questions) ──
  const [ballotRelevantAxes, setBallotRelevantAxes] = useState<Set<string> | null>(
    () => assessmentProgress?.ballotRelevantAxes
      ? new Set(assessmentProgress.ballotRelevantAxes)
      : null,
  );

  // ── Animation state ──
  const [fadeVisible, setFadeVisible] = useState(true);

  // ── Fine-tuning state ──
  const [fineTuningResponses, setFineTuningResponses] = useState<
    Record<string, Record<string, number>>
  >({});
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);

  // ── Feedback screen label ──
  useEffect(() => {
    if (pageState === 'intro') {
      setScreenLabel('Blueprint - Intro');
    } else if (pageState === 'demographics') {
      setScreenLabel('Blueprint - Demographics');
    } else if (pageState === 'assessment') {
      setScreenLabel(
        `Blueprint - Assessment (Q${currentAxisIndex + 1}/${axisQueue.length || '?'})`,
      );
    } else if (pageState === 'fine_tuning') {
      setScreenLabel('Blueprint - Fine-tuning');
    } else if (pageState === 'results') {
      setScreenLabel('Blueprint - Results');
    }
  }, [pageState, currentAxisIndex, axisQueue.length, setScreenLabel]);

  // ── Persist assessment progress helper ──
  const saveProgress = useCallback(
    (
      queue: string[],
      index: number,
      positions: Record<string, number>,
      strengths: Record<string, number>,
    ) => {
      saveAssessmentProgress({
        axisQueue: queue,
        currentAxisIndex: index,
        sliderPositions: positions,
        strengthValues: strengths,
        ballotRelevantAxes: ballotRelevantAxes ? Array.from(ballotRelevantAxes) : undefined,
      });
    },
    [saveAssessmentProgress, ballotRelevantAxes],
  );

  // ── Build axis queue from spec, filtered to ballot-relevant axes ──
  const buildAxisQueue = useCallback((relevantAxes?: Set<string>): string[] => {
    if (!spec) return [];
    const axes: string[] = [];
    for (const domain of spec.domains) {
      for (const axisId of domain.axes) {
        // Only include axes that have slider configs
        if (!getSliderConfig(axisId)) continue;
        // If we have ballot context, only include axes that appear on the ballot
        if (relevantAxes && relevantAxes.size > 0 && !relevantAxes.has(axisId)) continue;
        axes.push(axisId);
      }
    }
    return axes;
  }, [spec]);

  // ── Handlers ──

  const startAssessment = (relevantAxes?: Set<string>) => {
    const queue = buildAxisQueue(relevantAxes);
    if (queue.length === 0) return;

    isRetaking.current = false;
    setAxisQueue(queue);
    setCurrentAxisIndex(0);
    setSliderPositions({});
    setStrengthValues({});
    setFadeVisible(true);
    setBallotRelevantAxes(relevantAxes ?? null);
    saveProgress(queue, 0, {}, {});
    setPageState('assessment');
  };

  /** Collect all axis IDs that appear on a ballot's items */
  const collectRelevantAxes = useCallback((ballotItems: ReturnType<typeof transformBallot>['items']): Set<string> => {
    const axes = new Set<string>();
    for (const item of ballotItems) {
      if (item.relevantAxes) {
        for (const a of item.relevantAxes) axes.add(a);
      }
      if (item.yesAxisEffects) {
        for (const a of Object.keys(item.yesAxisEffects)) axes.add(a);
      }
      if (item.type === 'candidate_race' && item.candidates) {
        for (const c of item.candidates) {
          if (c.profile?.stances) {
            for (const a of Object.keys(c.profile.stances)) axes.add(a);
          }
        }
      }
    }
    return axes;
  }, []);

  const handleDemographicsComplete = async () => {
    const ballotId = useDemographicStore.getState().profile.selectedBallotId;
    if (ballotId) {
      try {
        const ballot = await ballotApi.getById(ballotId);
        const { items } = transformBallot(ballot);
        const relevant = collectRelevantAxes(items);
        startAssessment(relevant);
        return;
      } catch (err) {
        console.warn('[Blueprint] Failed to load ballot for axis filtering, using all axes:', err);
      }
    }
    // Fallback: no ballot or fetch failed — ask all axes
    startAssessment();
  };

  const currentAxisId = axisQueue[currentAxisIndex] ?? '';
  const currentConfig = getSliderConfig(currentAxisId);
  const currentSliderPos = sliderPositions[currentAxisId] ?? (currentConfig?.currentPolicyIndex ?? 2);
  const currentStrength = strengthValues[currentAxisId] ?? DEFAULT_STRENGTH_VALUE;

  const handleSliderChange = (pos: number) => {
    const updated = { ...sliderPositions, [currentAxisId]: pos };
    setSliderPositions(updated);
    saveProgress(axisQueue, currentAxisIndex, updated, strengthValues);
  };

  const handleStrengthChange = (val: number) => {
    const updated = { ...strengthValues, [currentAxisId]: val };
    setStrengthValues(updated);
    saveProgress(axisQueue, currentAxisIndex, sliderPositions, updated);
  };

  const animateTransition = useCallback((callback: () => void) => {
    setFadeVisible(false);
    setTimeout(() => {
      callback();
      setFadeVisible(true);
    }, 200);
  }, []);

  const handleNext = () => {
    // Save current axis values
    const updatedPositions = { ...sliderPositions, [currentAxisId]: currentSliderPos };
    const updatedStrengths = { ...strengthValues, [currentAxisId]: currentStrength };
    setSliderPositions(updatedPositions);
    setStrengthValues(updatedStrengths);

    if (currentAxisIndex >= axisQueue.length - 1) {
      // Finished — apply all slider values to the profile
      applySliderValues(updatedPositions, updatedStrengths);
      completeAssessment();
      clearAssessmentProgress();
      setPageState('results');
      return;
    }

    const nextIndex = currentAxisIndex + 1;

    animateTransition(() => {
      setCurrentAxisIndex(nextIndex);
      saveProgress(axisQueue, nextIndex, updatedPositions, updatedStrengths);
    });
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      const prevIndex = currentAxisIndex - 1;
      animateTransition(() => {
        setCurrentAxisIndex(prevIndex);
        saveProgress(axisQueue, prevIndex, sliderPositions, strengthValues);
      });
    }
  };

  const handleRetake = () => {
    isRetaking.current = true;
    setSliderPositions({});
    setStrengthValues({});
    setFineTuningResponses({});
    setAxisQueue([]);
    setCurrentAxisIndex(0);
    setBallotRelevantAxes(null);
    clearAssessmentProgress();
    resetDemographics();
    resetBlueprint();
    setPageState('demographics');
  };

  const handleFineTune = (axisId: string) => {
    setFineTuningAxisId(axisId);
    setPageState('fine_tuning');
  };

  const handleFineTuningComplete = (responses: Record<string, number>) => {
    if (fineTuningAxisId) {
      setFineTuningResponses((prev) => ({
        ...prev,
        [fineTuningAxisId]: responses,
      }));

      // Update the axis value based on fine-tuning results
      const score = calculateFineTunedScore(fineTuningAxisId, responses);
      if (score !== null) {
        const newValue = Math.round((score + 1) * 5); // Convert -1..+1 to 0..10
        updateAxisValue(fineTuningAxisId, newValue);
      }
    }
    setFineTuningAxisId(null);
    setPageState('results');
  };

  const handleFineTuningCancel = () => {
    setFineTuningAxisId(null);
    setPageState('results');
  };

  const handleChangeAxis = (axisId: string, value: number) => {
    updateAxisValue(axisId, value);
  };

  const handleChangeAxisImportance = (axisId: string, value: number) => {
    updateAxisImportance(axisId, value);
  };

  // ── Derived values ──
  const metaDimensions = profile ? deriveMetaDimensions(profile) : null;

  // ── Loading state ──
  if (isLoading || !spec) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary" />
        <p className="mt-3 text-gray-500">Loading...</p>
      </div>
    );
  }

  // ── Intro (acts as entry point — immediately routes to demographics or assessment) ──
  if (pageState === 'intro') {
    return (
      <>
        {showOnboarding && <IntroScreen onClose={handleCloseOnboarding} />}
        <DemographicScreen onComplete={handleDemographicsComplete} />
      </>
    );
  }

  // ── Demographics ──
  if (pageState === 'demographics') {
    return <DemographicScreen onComplete={handleDemographicsComplete} />;
  }

  // ── Assessment ──
  if (pageState === 'assessment') {
    return (
      <AssessmentView
        spec={spec}
        axisQueue={axisQueue}
        currentAxisIndex={currentAxisIndex}
        sliderPosition={currentSliderPos}
        currentStrength={currentStrength}
        fadeVisible={fadeVisible}
        onSliderChange={handleSliderChange}
        onStrengthChange={handleStrengthChange}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  // ── Fine-tuning ──
  if (pageState === 'fine_tuning' && fineTuningAxisId) {
    return (
      <FineTuningScreen
        axisId={fineTuningAxisId}
        spec={spec}
        existingResponses={fineTuningResponses[fineTuningAxisId] || {}}
        onComplete={handleFineTuningComplete}
        onCancel={handleFineTuningCancel}
      />
    );
  }

  // ── Results ──
  if (pageState === 'results' && profile) {
    return (
      <BlueprintSummaryView
        profile={profile}
        spec={spec}
        metaDimensions={metaDimensions}
        fineTuningResponses={fineTuningResponses}
        onRetake={handleRetake}
        onFineTune={handleFineTune}
        onChangeAxis={handleChangeAxis}
        onChangeAxisImportance={handleChangeAxisImportance}
      />
    );
  }

  // Fallback — shouldn't happen
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-gray-50">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="mt-3 text-gray-600">Something went wrong. Please refresh.</p>
      <button
        className="mt-4 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        onClick={handleRetake}
      >
        Start Over
      </button>
    </div>
  );
}
