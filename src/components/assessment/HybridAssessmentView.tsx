'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { axisSliderConfigs } from '@/data/sliderPositions';
import type {
  HybridAssessmentSession,
  ConfirmationCard as ConfirmationCardType,
  ClassifiedSignal,
  ModalitySwitch,
  UserValueRecord,
} from '@/types/hybridAssessment';
import type { ValueSignal } from '@/types/conversation';
import {
  createHybridSession,
  getCurrentAxis,
  processStructuredSelection,
  processNlpSignals,
  processSecondaryConfirmation,
  skipAxis,
  recordModalitySwitch,
  evaluateHybridStopping,
  getFullProfile,
  getProgress,
} from '@/lib/hybridSession';
import { evaluateTriggers, isNuancedAxis } from '@/lib/modalityTriggers';
import { classifySignals, buildConfirmationCard } from '@/lib/multiAxisExtraction';
import type { BallotRelevanceWeights } from '@/lib/adaptiveSequencer';

import AssessmentProgress from './AssessmentProgress';
import CardQuestion from './CardQuestion';
import NlpPanel from './NlpPanel';
import SignalReviewCard from './SignalReviewCard';
import ConfirmationCard from './ConfirmationCard';
import ProfileSummary from './ProfileSummary';

// ── Types ──

type ViewState =
  | { type: 'card' }
  | { type: 'nlp' }
  | { type: 'signal-review'; userText: string; classified: ClassifiedSignal[]; pendingSession: HybridAssessmentSession; confirmationCard: ConfirmationCardType | null }
  | { type: 'confirmation'; card: ConfirmationCardType; signals: ClassifiedSignal[] }
  | { type: 'summary'; profile: Record<string, UserValueRecord> };

interface HybridAssessmentViewProps {
  /** Ballot-derived per-axis importance weights */
  ballotWeights?: BallotRelevanceWeights;
  /** Returning user profile for warm start */
  returningProfile?: Record<string, { value: number; confidence: number }>;
  /** Called when assessment is complete and user confirms profile */
  onComplete: (profile: Record<string, UserValueRecord>) => void;
}

// ── Position label helper ──

function getPositionLabel(axisId: string, score: number): string {
  const config = axisSliderConfigs[axisId];
  if (!config) return `Score: ${score.toFixed(1)}`;
  const posCount = config.positions.length;
  const index = Math.round((score / 10) * (posCount - 1));
  const clamped = Math.max(0, Math.min(posCount - 1, index));
  return config.positions[clamped].title;
}

// ── Component ──

export default function HybridAssessmentView({
  ballotWeights = {},
  returningProfile,
  onComplete,
}: HybridAssessmentViewProps) {
  const [session, setSession] = useState<HybridAssessmentSession>(() =>
    createHybridSession(`hybrid-${Date.now()}`, ballotWeights, returningProfile),
  );
  const [viewState, setViewState] = useState<ViewState>({ type: 'card' });
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the trigger that opened NLP for recording modality switches
  const nlpTriggerRef = useRef<string | null>(null);

  const currentAxisId = getCurrentAxis(session);
  const currentAxisConfig = currentAxisId ? axisSliderConfigs[currentAxisId] : null;
  const progress = useMemo(() => getProgress(session, ballotWeights), [session, ballotWeights]);
  const stopping = useMemo(() => evaluateHybridStopping(session, ballotWeights), [session, ballotWeights]);

  // ── Structured card selection ──

  const handleCardSelect = useCallback(
    (value: number, dwellTimeMs: number) => {
      if (!currentAxisId) return;

      const updated = processStructuredSelection(
        session,
        currentAxisId,
        value,
        dwellTimeMs,
        ballotWeights,
      );
      setSession(updated);

      // Check for T2 trigger (confused neutral)
      const trigger = evaluateTriggers({
        currentModality: 'structured',
        selectedPosition: value,
        dwellTimeMs,
        consecutiveNeutrals: updated.consecutiveNeutrals,
        nlpTurnsOnCurrentAxis: 0,
        axisConfidence: 0,
        axisId: currentAxisId,
      });

      if (trigger?.id === 'T2') {
        // Don't auto-switch — the selection stands. Just note it for potential UI hint.
        // The next question will load naturally.
      }

      // Check if session should stop
      const newStopping = evaluateHybridStopping(updated, ballotWeights);
      if (newStopping.shouldStop) {
        setViewState({ type: 'summary', profile: getFullProfile(updated) });
      } else {
        setViewState({ type: 'card' });
      }
    },
    [session, currentAxisId, ballotWeights],
  );

  // ── Escape hatch — switch to NLP ──

  const handleEscapeHatch = useCallback(() => {
    if (!currentAxisId) return;
    nlpTriggerRef.current = 'T1';

    const updated = recordModalitySwitch(session, {
      from: 'structured',
      to: 'nlp',
      triggerId: 'T1',
      turnNumber: session.interactionCount,
      confidenceAtSwitch: 0,
    });
    setSession(updated);
    setViewState({ type: 'nlp' });
  }, [session, currentAxisId]);

  // ── Show cards (back from NLP) ──

  const handleShowCards = useCallback(() => {
    const updated = recordModalitySwitch(session, {
      from: 'nlp',
      to: 'structured',
      triggerId: 'T5',
      turnNumber: session.interactionCount,
      confidenceAtSwitch: 0,
    });
    setSession(updated);
    setViewState({ type: 'card' });
  }, [session]);

  // ── NLP submission ──

  const handleNlpSubmit = useCallback(
    async (text: string) => {
      if (!currentAxisId) return;
      setIsExtracting(true);
      setError(null);

      try {
        // Call the multi-axis extraction API
        const response = await fetch('/api/assessment/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            askedAxis: currentAxisId,
            userInput: text,
            answeredAxes: session.answeredAxes,
            currentProfile: Object.fromEntries(
              Object.entries(session.axes)
                .filter(([, a]) => a.currentRecord)
                .map(([id, a]) => [id, { value: a.pointEstimate, confidence: a.confidenceByModality.mergedConfidence }]),
            ),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Extraction failed');
        }

        const data: { signals: ValueSignal[]; meta: { askedAxis: string; axesCovered: string[]; overallClarity: number } } =
          await response.json();

        // Classify signals
        const classified = classifySignals(currentAxisId, data.signals);

        // Process through hybrid session (hold the result — don't commit until user confirms)
        const result = processNlpSignals(
          session,
          currentAxisId,
          classified,
          ballotWeights,
          getPositionLabel,
        );

        // Check for T6 trigger (vague response) — skip review if vague
        const primarySignal = classified.find((s) => s.strength === 'primary');
        if (primarySignal) {
          const trigger = evaluateTriggers({
            currentModality: 'nlp',
            consecutiveNeutrals: 0,
            nlpTurnsOnCurrentAxis: result.session.axes[currentAxisId]?.modalityRecord.nlpTurnCount ?? 0,
            axisConfidence: primarySignal.hybridConfidence,
            axisId: currentAxisId,
            nlpExtractionResult: {
              primarySignal: {
                confidence: primarySignal.rawSignal.confidence,
                direction: primarySignal.rawSignal.direction,
              },
            },
          });

          if (trigger?.id === 'T6') {
            // Vague response — switch back to cards without review
            handleShowCards();
            return;
          }
        }

        // Show signal review card so user can verify what the system heard
        setViewState({
          type: 'signal-review',
          userText: text,
          classified,
          pendingSession: result.session,
          confirmationCard: result.confirmationCard,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsExtracting(false);
      }
    },
    [session, currentAxisId, ballotWeights, handleShowCards],
  );

  // ── Signal review: user accepts extraction ──

  const handleSignalAccept = useCallback(() => {
    if (viewState.type !== 'signal-review') return;

    // Commit the pending session
    setSession(viewState.pendingSession);

    // If there are secondary signals, show confirmation card next
    if (viewState.confirmationCard) {
      setViewState({
        type: 'confirmation',
        card: viewState.confirmationCard,
        signals: viewState.classified,
      });
    } else {
      // Check stopping
      const newStopping = evaluateHybridStopping(viewState.pendingSession, ballotWeights);
      if (newStopping.shouldStop) {
        setViewState({ type: 'summary', profile: getFullProfile(viewState.pendingSession) });
      } else {
        setViewState({ type: 'card' });
      }
    }
  }, [viewState, ballotWeights]);

  // ── Signal review: user wants to clarify ──

  const handleSignalRefine = useCallback(() => {
    // Go back to NLP panel so user can re-answer — don't commit the pending session
    setViewState({ type: 'nlp' });
  }, []);

  // ── Confirmation card ──

  const handleConfirmSecondary = useCallback(
    (confirmedAxisIds: string[]) => {
      const updated = processSecondaryConfirmation(session, confirmedAxisIds, ballotWeights);
      setSession(updated);

      const newStopping = evaluateHybridStopping(updated, ballotWeights);
      if (newStopping.shouldStop) {
        setViewState({ type: 'summary', profile: getFullProfile(updated) });
      } else {
        setViewState({ type: 'card' });
      }
    },
    [session, ballotWeights],
  );

  // ── Skip ──

  const handleSkip = useCallback(() => {
    if (!currentAxisId) return;
    const updated = skipAxis(session, currentAxisId, ballotWeights);
    setSession(updated);

    const newStopping = evaluateHybridStopping(updated, ballotWeights);
    if (newStopping.shouldStop) {
      setViewState({ type: 'summary', profile: getFullProfile(updated) });
    } else {
      setViewState({ type: 'card' });
    }
  }, [session, currentAxisId, ballotWeights]);

  // ── Override imputed axis from summary ──

  const handleOverrideAxis = useCallback(
    (axisId: string) => {
      // TODO: Jump to that specific axis in card mode
      // For now, this is a stub — the session would need to insert the axis at the front of the queue
      setViewState({ type: 'card' });
    },
    [],
  );

  // ── Profile confirmed ──

  const handleProfileConfirm = useCallback(() => {
    const profile = getFullProfile(session);
    onComplete(profile);
  }, [session, onComplete]);

  // ── Render ──

  // Summary view
  if (viewState.type === 'summary') {
    return (
      <ProfileSummary
        profile={viewState.profile}
        onOverrideAxis={handleOverrideAxis}
        onConfirm={handleProfileConfirm}
      />
    );
  }

  // No more questions (shouldn't happen if stopping works correctly)
  if (!currentAxisId || !currentAxisConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500">Finalizing your profile...</p>
      </div>
    );
  }

  // Signal review view — show user what was extracted from their voice/text
  if (viewState.type === 'signal-review') {
    return (
      <div className="flex flex-col h-full">
        <AssessmentProgress
          progress={progress}
          questionsAnswered={session.answeredAxes.length}
          estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
        />
        <div className="flex-1 overflow-y-auto flex items-start justify-center pt-4">
          <SignalReviewCard
            userText={viewState.userText}
            signals={viewState.classified}
            onAccept={handleSignalAccept}
            onRefine={handleSignalRefine}
          />
        </div>
      </div>
    );
  }

  // Confirmation card view
  if (viewState.type === 'confirmation') {
    return (
      <div className="flex flex-col h-full">
        <AssessmentProgress
          progress={progress}
          questionsAnswered={session.answeredAxes.length}
          estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
        />
        <div className="flex-1 overflow-y-auto flex items-start justify-center pt-4">
          <ConfirmationCard
            card={viewState.card}
            onConfirm={handleConfirmSecondary}
          />
        </div>
      </div>
    );
  }

  // NLP panel view
  if (viewState.type === 'nlp') {
    return (
      <div className="flex flex-col h-full">
        <AssessmentProgress
          progress={progress}
          questionsAnswered={session.answeredAxes.length}
          estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
        />
        <NlpPanel
          axisConfig={currentAxisConfig}
          onSubmit={handleNlpSubmit}
          onShowCards={handleShowCards}
          isExtracting={isExtracting}
        />
        {error && (
          <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Card question view (default)
  return (
    <div className="flex flex-col h-full">
      <AssessmentProgress
        progress={progress}
        questionsAnswered={session.answeredAxes.length}
        estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
      />
      <CardQuestion
        key={currentAxisId}
        axisConfig={currentAxisConfig}
        isNuancedAxis={isNuancedAxis(currentAxisId)}
        onSelect={handleCardSelect}
        onEscapeHatch={handleEscapeHatch}
        onSkip={handleSkip}
      />
      {error && (
        <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
