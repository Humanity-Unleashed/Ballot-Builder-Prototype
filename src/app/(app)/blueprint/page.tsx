'use client';

/**
 * Blueprint Page - Slider-Based Civic Blueprint Assessment
 *
 * State machine: intro → assessment → [fine_tuning] → results
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

import { useBlueprint } from '@/context/BlueprintContext';
import { useFeedbackScreen } from '@/context/FeedbackScreenContext';
import { getSliderConfig } from '@/data/sliderPositions';
import { deriveMetaDimensions } from '@/lib/archetypes';
import { checkForAxisTransition, DEFAULT_STRENGTH_VALUE } from '@/lib/blueprintHelpers';

import IntroScreen from '@/components/blueprint/IntroScreen';
import AssessmentView from '@/components/blueprint/AssessmentView';
import BlueprintView from '@/components/blueprint/BlueprintView';
import FineTuningScreen from '@/components/blueprint/FineTuningScreen';

type PageState = 'intro' | 'assessment' | 'fine_tuning' | 'results';

export default function BlueprintPage() {
  const {
    spec,
    profile,
    isLoading,
    applySliderValues,
    updateAxisValue,
    updateAxisImportance,
  } = useBlueprint();

  const { setScreenLabel } = useFeedbackScreen();

  // ── Page state machine ──
  const [pageState, setPageState] = useState<PageState>('intro');

  // ── Assessment state ──
  const [axisQueue, setAxisQueue] = useState<string[]>([]);
  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>({});
  const [strengthValues, setStrengthValues] = useState<Record<string, number>>({});

  // ── Animation state ──
  const [fadeVisible, setFadeVisible] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // ── Fine-tuning state ──
  const [fineTuningResponses, setFineTuningResponses] = useState<
    Record<string, Record<string, number>>
  >({});
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);

  // ── Feedback screen label ──
  useEffect(() => {
    if (pageState === 'intro') {
      setScreenLabel('Blueprint - Intro');
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

  // ── If profile already has real scores, jump to results ──
  useEffect(() => {
    if (!spec || !profile || pageState !== 'intro') return;
    const hasRealScores = profile.domains.some((d) =>
      d.axes.some((a) => a.source !== 'default'),
    );
    if (hasRealScores) {
      setPageState('results');
    }
  }, [spec, profile, pageState]);

  // ── Build axis queue from spec ──
  const buildAxisQueue = useCallback((): string[] => {
    if (!spec) return [];
    const axes: string[] = [];
    for (const domain of spec.domains) {
      for (const axisId of domain.axes) {
        // Only include axes that have slider configs
        if (getSliderConfig(axisId)) {
          axes.push(axisId);
        }
      }
    }
    return axes;
  }, [spec]);

  // ── Handlers ──

  const handleStart = () => {
    const queue = buildAxisQueue();
    if (queue.length === 0) return;

    setAxisQueue(queue);
    setCurrentAxisIndex(0);
    setSliderPositions({});
    setStrengthValues({});
    setFadeVisible(true);
    setShowTransition(false);
    setPageState('assessment');
  };

  const currentAxisId = axisQueue[currentAxisIndex] ?? '';
  const currentConfig = getSliderConfig(currentAxisId);
  const currentSliderPos = sliderPositions[currentAxisId] ?? (currentConfig?.currentPolicyIndex ?? 2);
  const currentStrength = strengthValues[currentAxisId] ?? DEFAULT_STRENGTH_VALUE;

  const handleSliderChange = (pos: number) => {
    setSliderPositions((prev) => ({ ...prev, [currentAxisId]: pos }));
  };

  const handleStrengthChange = (val: number) => {
    setStrengthValues((prev) => ({ ...prev, [currentAxisId]: val }));
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
      setPageState('results');
      return;
    }

    // Check for domain transition message
    const message = checkForAxisTransition(currentAxisIndex + 1, axisQueue.length);
    if (message) {
      setTransitionMessage(message);
      setShowTransition(true);
      setTimeout(() => {
        setShowTransition(false);
        animateTransition(() => {
          setCurrentAxisIndex((i) => i + 1);
        });
      }, 1500);
    } else {
      animateTransition(() => {
        setCurrentAxisIndex((i) => i + 1);
      });
    }
  };

  const handleBack = () => {
    if (currentAxisIndex > 0) {
      animateTransition(() => {
        setCurrentAxisIndex((i) => i - 1);
      });
    }
  };

  const handleRetake = () => {
    setSliderPositions({});
    setStrengthValues({});
    setFineTuningResponses({});
    setAxisQueue([]);
    setCurrentAxisIndex(0);
    setPageState('intro');
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
        <p className="mt-3 text-gray-500">Loading...</p>
      </div>
    );
  }

  // ── Intro ──
  if (pageState === 'intro') {
    return <IntroScreen spec={spec} onStart={handleStart} />;
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
        showTransition={showTransition}
        transitionMessage={transitionMessage}
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
      <BlueprintView
        profile={profile}
        blueprintSpec={spec}
        metaDimensions={metaDimensions}
        fineTuningResponses={fineTuningResponses}
        onRetake={handleRetake}
        onEditingAxisChange={() => {}}
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
        className="mt-4 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        onClick={handleRetake}
      >
        Start Over
      </button>
    </div>
  );
}
