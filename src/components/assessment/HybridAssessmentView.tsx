'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { axisSliderConfigs } from '@/data/sliderPositions';
import { getFineTuningConfig } from '@/data/fineTuningPositions';
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
  processFineTuningRefinement,
  skipAxis,
  recordModalitySwitch,
  evaluateHybridStopping,
  getFullProfile,
  getProgress,
} from '@/lib/hybridSession';
import { evaluateTriggers, isNuancedAxis } from '@/lib/modalityTriggers';
import { classifySignals, buildConfirmationCard } from '@/lib/multiAxisExtraction';
import type { BallotRelevanceWeights } from '@/lib/adaptiveSequencer';
import { civicAxesSpec } from '@/server/data/civicAxes/spec';
import { DOMAIN_ORDER, DOMAIN_LABELS, DOMAIN_AXES } from '@/types/conversation';
import type { DomainId } from '@/types/conversation';

import { useUserStore } from '@/stores/userStore';
import AssessmentProgress from './AssessmentProgress';
import CardQuestion from './CardQuestion';
import NlpPanel from './NlpPanel';
import SignalReviewCard from './SignalReviewCard';
import ConfirmationCard from './ConfirmationCard';
import RefineOfferCard from './RefineOfferCard';
import ProfileSummary from './ProfileSummary';
import HybridFineTuningView from '@/components/blueprint/HybridFineTuningView';

// ── Types ──

type ViewState =
  | { type: 'card' }
  | { type: 'nlp' }
  | { type: 'signal-review'; userText: string; classified: ClassifiedSignal[]; pendingSession: HybridAssessmentSession; confirmationCard: ConfirmationCardType | null }
  | { type: 'confirmation'; card: ConfirmationCardType; signals: ClassifiedSignal[] }
  | { type: 'refine-offer'; axisId: string; selectedValue: number }
  | { type: 'refine'; axisId: string; selectedValue: number }
  | { type: 'finish-early' }
  | { type: 'checkpoint' }
  | { type: 'summary'; profile: Record<string, UserValueRecord> };

interface HybridAssessmentViewProps {
  /** Ballot-derived per-axis importance weights */
  ballotWeights?: BallotRelevanceWeights;
  /** Returning user profile for warm start */
  returningProfile?: Record<string, { value: number; confidence: number }>;
  /** Saved session to resume (from localStorage) */
  resumeSession?: HybridAssessmentSession | null;
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
  resumeSession,
  onComplete,
}: HybridAssessmentViewProps) {
  const [session, setSession] = useState<HybridAssessmentSession>(() =>
    resumeSession ?? createHybridSession(`hybrid-${Date.now()}`, ballotWeights, returningProfile),
  );
  const [viewState, setViewState] = useState<ViewState>({ type: 'card' });
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist session to localStorage after each answer
  const saveHybridSession = useUserStore((s) => s.saveHybridSession);
  const clearHybridSession = useUserStore((s) => s.clearHybridSession);

  useEffect(() => {
    if (!session.readyForMatching) {
      saveHybridSession(session);
    }
  }, [session, saveHybridSession]);

  // Track the trigger that opened NLP for recording modality switches
  const nlpTriggerRef = useRef<string | null>(null);

  const currentAxisId = getCurrentAxis(session);
  const currentAxisConfig = currentAxisId ? axisSliderConfigs[currentAxisId] : null;
  const progress = useMemo(() => getProgress(session, ballotWeights), [session, ballotWeights]);
  const stopping = useMemo(() => evaluateHybridStopping(session, ballotWeights), [session, ballotWeights]);
  const canFinishEarly = session.interactionCount >= 5;

  // ── Advance to next question or stop ──

  const advanceOrStop = useCallback(
    (updatedSession: HybridAssessmentSession) => {
      const newStopping = evaluateHybridStopping(updatedSession, ballotWeights);
      if (newStopping.shouldStop) {
        setViewState({ type: 'summary', profile: getFullProfile(updatedSession) });
      } else if (newStopping.shouldCheckpoint) {
        setViewState({ type: 'checkpoint' });
      } else {
        setViewState({ type: 'card' });
      }
    },
    [ballotWeights],
  );

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

      // Check if this axis has fine-tuning sub-dimensions to offer
      const ftConfig = getFineTuningConfig(currentAxisId);
      if (ftConfig && ftConfig.subDimensions.length > 0) {
        // Offer refinement before moving on
        setViewState({ type: 'refine-offer', axisId: currentAxisId, selectedValue: value });
        return;
      }

      // No fine-tuning available — advance normally
      advanceOrStop(updated);
    },
    [session, currentAxisId, ballotWeights, advanceOrStop],
  );

  // ── Refine offer: user accepts → show fine-tuning ──

  const handleRefineAccept = useCallback(() => {
    if (viewState.type !== 'refine-offer') return;
    setViewState({ type: 'refine', axisId: viewState.axisId, selectedValue: viewState.selectedValue });
  }, [viewState]);

  // ── Refine offer: user declines → advance normally ──

  const handleRefineDecline = useCallback(() => {
    advanceOrStop(session);
  }, [session, advanceOrStop]);

  // ── Fine-tuning complete → process sub-dimension responses ──

  const handleFineTuningComplete = useCallback(
    (responses: Record<string, number>) => {
      if (viewState.type !== 'refine') return;
      const axisId = viewState.axisId;

      // Build position counts map from the fine-tuning config
      const ftConfig = getFineTuningConfig(axisId);
      const positionCounts: Record<string, number> = {};
      if (ftConfig) {
        for (const sub of ftConfig.subDimensions) {
          positionCounts[sub.id] = sub.positions.length;
        }
      }

      const updated = processFineTuningRefinement(
        session,
        axisId,
        responses,
        positionCounts,
        ballotWeights,
      );
      setSession(updated);
      advanceOrStop(updated);
    },
    [viewState, session, ballotWeights, advanceOrStop],
  );

  // ── Fine-tuning cancelled → advance without refinement ──

  const handleFineTuningCancel = useCallback(() => {
    advanceOrStop(session);
  }, [session, advanceOrStop]);

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
      advanceOrStop(viewState.pendingSession);
    }
  }, [viewState, advanceOrStop]);

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
      advanceOrStop(updated);
    },
    [session, ballotWeights, advanceOrStop],
  );

  // ── Skip ──

  const handleSkip = useCallback(() => {
    if (!currentAxisId) return;
    const updated = skipAxis(session, currentAxisId, ballotWeights);
    setSession(updated);
    advanceOrStop(updated);
  }, [session, currentAxisId, ballotWeights, advanceOrStop]);

  // ── Finish early ──

  const handleFinishEarly = useCallback(() => {
    setViewState({ type: 'finish-early' });
  }, []);

  const handleFinishEarlyConfirm = useCallback(() => {
    setViewState({ type: 'summary', profile: getFullProfile(session) });
  }, [session]);

  const handleFinishEarlyCancel = useCallback(() => {
    setViewState({ type: 'card' });
  }, []);

  // ── Checkpoint handlers ──

  const handleCheckpointSeeResults = useCallback(() => {
    const updated = { ...session, checkpointShown: true };
    setSession(updated);
    setViewState({ type: 'summary', profile: getFullProfile(updated) });
  }, [session]);

  const handleCheckpointContinue = useCallback(() => {
    const updated = { ...session, checkpointShown: true, checkpointDismissed: true };
    setSession(updated);
    setViewState({ type: 'card' });
  }, [session]);

  // ── Override imputed axis from summary ──

  const handleOverrideAxis = useCallback(
    (axisId: string) => {
      // TODO: Jump to that specific axis in card mode
      // For now, this is a stub — the session would need to insert the axis at the front of the queue
      setViewState({ type: 'card' });
    },
    [],
  );

  // ── Auto-advance when assessment is complete ──

  useEffect(() => {
    if (viewState.type === 'summary') {
      clearHybridSession();
      const profile = getFullProfile(session);
      onComplete(profile);
    }
  }, [viewState.type]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──

  // Assessment complete — show brief loading while advancing
  if (viewState.type === 'summary') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500">Building your profile...</p>
      </div>
    );
  }

  // Finish early interstitial
  if (viewState.type === 'finish-early') {
    const answered = session.answeredAxes.length;
    const total = 17;
    const domainMap: Record<string, string> = {
      econ: 'Economy', health: 'Healthcare', housing: 'Housing',
      justice: 'Justice', climate: 'Climate',
    };
    const coveredDomains = new Set(
      session.answeredAxes.map((id) => id.split('_')[0])
    );
    const uncoveredDomains = Object.entries(domainMap)
      .filter(([key]) => !coveredDomains.has(key))
      .map(([, name]) => name);

    return (
      <div className="flex flex-col h-full">
        <AssessmentProgress
          progress={progress}
          questionsAnswered={answered}
          estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
        />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 rounded-full px-4 py-2 mb-3">
                <span className="text-sm font-semibold text-brand-primary">
                  {answered} of {total} topics covered
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Good start!</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">
                You&apos;ve covered enough for initial matches.
                {uncoveredDomains.length > 0 && (
                  <> Answering more — especially on{' '}
                    <strong className="text-gray-700">
                      {uncoveredDomains.slice(0, 2).join(' and ')}
                    </strong>
                    {' '}— will make your results more accurate.</>
                )}
              </p>
            </div>

            {uncoveredDomains.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Still uncovered</p>
                <div className="flex flex-wrap gap-1.5">
                  {uncoveredDomains.map((name) => (
                    <span key={name} className="px-2.5 py-1 rounded-full bg-white border border-border-default text-[11px] font-medium text-gray-600">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleFinishEarlyCancel}
                className="w-full py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
              >
                Keep going (~{session.estimatedRemainingInteractions} more question{session.estimatedRemainingInteractions !== 1 ? 's' : ''})
              </button>
              <button
                onClick={handleFinishEarlyConfirm}
                className="w-full py-3 rounded-xl border border-border-default bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                See my results now
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                You can always come back to answer more later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkpoint screen — offer user a natural stopping point
  if (viewState.type === 'checkpoint') {
    const answered = session.answeredAxes.length;
    const coveredAxes = new Set(session.answeredAxes);

    // Compute per-domain coverage
    type DomainCoverage = { id: DomainId; label: string; status: 'covered' | 'partial' | 'uncovered' };
    const domainCoverage: DomainCoverage[] = DOMAIN_ORDER.map((domainId) => {
      const axes = DOMAIN_AXES[domainId];
      const answeredCount = axes.filter((a) => coveredAxes.has(a)).length;
      const status: DomainCoverage['status'] =
        answeredCount >= 2 ? 'covered'
        : answeredCount >= 1 ? 'partial'
        : 'uncovered';
      return { id: domainId, label: DOMAIN_LABELS[domainId], status };
    });

    const confidencePct = Math.round(progress);
    const remaining = session.estimatedRemainingInteractions;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Confidence ring */}
          <div
            className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-5"
            style={{
              background: `conic-gradient(var(--color-brand-primary) 0deg, var(--color-brand-primary) ${confidencePct * 3.6}deg, #e5e7eb ${confidencePct * 3.6}deg)`,
            }}
          >
            <div className="w-[80px] h-[80px] rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-brand-primary leading-none">
                {confidencePct}%
              </span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                Ready
              </span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your Blueprint is ready</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-6">
            {answered} questions gave us a strong read on your values. We inferred the rest from patterns in your answers.
          </p>

          {/* Domain coverage pills */}
          <div className="w-full mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Topic coverage
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {domainCoverage.map((d) => (
                <span
                  key={d.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    d.status === 'covered'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : d.status === 'partial'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white ${
                      d.status === 'covered'
                        ? 'bg-green-500'
                        : d.status === 'partial'
                          ? 'bg-amber-400'
                          : 'bg-gray-300'
                    }`}
                  >
                    {d.status === 'covered' ? '\u2713' : d.status === 'partial' ? '\u2248' : '\u00B7'}
                  </span>
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="w-full max-w-[300px] space-y-2.5">
            <button
              onClick={handleCheckpointSeeResults}
              className="w-full py-3.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              See my results
            </button>
            <button
              onClick={handleCheckpointContinue}
              className="w-full py-3.5 rounded-xl border border-border-default bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sharpen results (~{remaining} more question{remaining !== 1 ? 's' : ''})
            </button>
            <p className="text-[11px] text-gray-400">
              You can always refine later from your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Refine offer view — ask if user wants to go deeper on sub-dimensions
  // Must be checked before the currentAxisId guard since these views carry their own axisId
  if (viewState.type === 'refine-offer') {
    const ftConfig = getFineTuningConfig(viewState.axisId);
    const axisSpec = civicAxesSpec.axes.find((a) => a.id === viewState.axisId);
    const axisName = axisSpec?.name ?? viewState.axisId;
    const posTitle = getPositionLabel(viewState.axisId, viewState.selectedValue);

    return (
      <div className="flex flex-col h-full">
        <AssessmentProgress
          progress={progress}
          questionsAnswered={session.answeredAxes.length}
          estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
        />
        <div className="flex-1 overflow-y-auto flex items-start justify-center">
          <RefineOfferCard
            axisName={axisName}
            subDimensionCount={ftConfig?.subDimensions.length ?? 0}
            selectedPositionTitle={posTitle}
            onAccept={handleRefineAccept}
            onDecline={handleRefineDecline}
          />
        </div>
      </div>
    );
  }

  // Fine-tuning view — inline sub-dimension questions
  if (viewState.type === 'refine') {
    return (
      <HybridFineTuningView
        axisId={viewState.axisId}
        spec={civicAxesSpec}
        existingResponses={{}}
        parentPositionTitle={getPositionLabel(viewState.axisId, viewState.selectedValue)}
        onComplete={handleFineTuningComplete}
        onCancel={handleFineTuningCancel}
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

  // Determine which weak domains this question helps (for post-checkpoint badge)
  const isPostCheckpoint = session.checkpointDismissed;
  const currentDomainLabel = (() => {
    if (!currentAxisId || !isPostCheckpoint) return null;
    const domainId = DOMAIN_ORDER.find((d) => DOMAIN_AXES[d].includes(currentAxisId));
    return domainId ? DOMAIN_LABELS[domainId] : null;
  })();

  // Card question view (default)
  return (
    <div className="flex flex-col h-full">
      <AssessmentProgress
        progress={progress}
        questionsAnswered={session.answeredAxes.length}
        estimatedRemaining={stopping.shouldStop ? 0 : session.estimatedRemainingInteractions}
      />
      {isPostCheckpoint && currentDomainLabel && (
        <div className="px-4 pb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/[0.08] text-[11px] font-semibold text-brand-primary">
            &#x2728; Sharpening {currentDomainLabel}
          </span>
        </div>
      )}
      <CardQuestion
        key={currentAxisId}
        axisConfig={currentAxisConfig}
        isNuancedAxis={isNuancedAxis(currentAxisId)}
        onSelect={handleCardSelect}
        onEscapeHatch={handleEscapeHatch}
        onSkip={handleSkip}
        onFinishEarly={canFinishEarly ? handleFinishEarly : undefined}
      />
      {error && (
        <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
