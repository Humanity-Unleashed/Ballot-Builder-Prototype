/**
 * Hybrid Session — Central orchestrator for the structured + NLP
 * modality-switching assessment flow.
 *
 * Ties together:
 * - Posterior engine (Bayesian updates, cross-axis propagation)
 * - Adaptive sequencer (EWIG-based question ordering, stopping criteria)
 * - Modality triggers (card <-> NLP switching)
 * - Multi-axis extraction (signal classification, confirmation)
 * - Conflict resolution (cross-modality merging)
 *
 * Reference: research/05_hybrid_flow.md Sections 4, 7
 */

import type {
  HybridAssessmentSession,
  HybridAxisState,
  UserValueRecord,
  ClassifiedSignal,
  ConfirmationCard,
  ModalitySwitch,
  HybridStoppingDecision,
  CoverageStatus,
} from '@/types/hybridAssessment';
import type { ValueSignal } from '@/types/conversation';
import { AXIS_IDS } from './correlationMatrix';
import {
  uniformPosterior,
  shannonEntropy,
  H_MAX,
  entropyConfidenceStructured,
  computeHybridConfidence,
  structuredSigma,
  structuredNeutralSigma,
} from './entropyConfidence';
import {
  type PosteriorMap,
  initializePosteriors,
  initializeFromProfile,
  bayesianUpdate,
  updateFromStructured,
  updateFromNLP,
  propagateCrossAxis,
  totalWeightedEntropy,
  maxWeightedEntropy,
} from './posteriorEngine';
import {
  selectNextAxis,
  evaluateStopping,
  imputeUnansweredAxes,
  estimateProgress,
  CHECKPOINT_QUESTIONS,
  type BallotRelevanceWeights,
} from './adaptiveSequencer';
import {
  classifySignals,
  buildConfirmationCard,
} from './multiAxisExtraction';

// ── Constants ──

const MAX_INTERACTIONS = 20;
const ALPHA_STRUCTURED = 0.35;

// ── Session initialization ──

/**
 * Create a new hybrid assessment session.
 *
 * @param sessionId      Unique session identifier
 * @param ballotWeights  Per-axis importance weights from the user's ballot
 * @param returningProfile  Optional: returning user's stored profile
 */
export function createHybridSession(
  sessionId: string,
  ballotWeights: BallotRelevanceWeights = {},
  returningProfile?: Record<string, { value: number; confidence: number }>,
): HybridAssessmentSession {
  // Initialize posteriors (uniform or from returning profile)
  const posteriors = returningProfile
    ? initializeFromProfile(returningProfile)
    : initializePosteriors();

  // Build per-axis state
  const axes: Record<string, HybridAxisState> = {};
  const answeredAxes: string[] = [];

  for (const axisId of AXIS_IDS) {
    const posterior = posteriors.get(axisId)!;
    const hasReturning = returningProfile?.[axisId] != null;

    axes[axisId] = {
      axisId,
      posterior: [...posterior.probs],
      entropy: posterior.entropy,
      pointEstimate: posterior.mean,
      modalityRecord: {
        modality: 'structured',
        nlpTurnCount: 0,
        switchHistory: [],
      },
      confidenceByModality: {
        structuredConfidence: null,
        nlpConfidence: null,
        imputedConfidence: null,
        mergedConfidence: hasReturning ? returningProfile![axisId].confidence : 0,
      },
      currentRecord: hasReturning
        ? {
            axisId,
            score: returningProfile![axisId].value,
            scoreNormalized: (returningProfile![axisId].value - 5.0) / 5.0,
            confidence: returningProfile![axisId].confidence,
            coverageStatus: 'answered',
            isImputed: false,
            sourceModality: 'structured',
            recordedAt: Date.now(),
          }
        : null,
      signalHistory: [],
      coverageStatus: hasReturning ? 'covered' : 'uncovered',
      importance: null,
      evidenceQuotes: [],
    };

    if (hasReturning) {
      answeredAxes.push(axisId);
    }
  }

  // Compute initial question queue via adaptive sequencer
  const answeredSet = new Set(answeredAxes);
  const questionQueue = computeQuestionQueue(posteriors, ballotWeights, answeredSet, []);

  // Compute session entropy
  const sessionEntropy = totalWeightedEntropy(posteriors, ballotWeights, answeredSet);

  return {
    sessionId,
    interactionCount: 0,
    maxInteractions: MAX_INTERACTIONS,
    defaultModality: 'structured',
    axes,
    questionQueue,
    currentQuestionIndex: 0,
    answeredAxes,
    confirmedAxes: [...answeredAxes],
    skippedAxes: [],
    modalitySwitchLog: [],
    totalNlpInteractions: 0,
    totalStructuredInteractions: 0,
    consecutiveNeutrals: 0,
    pendingSecondarySignals: [],
    sessionEntropy,
    estimatedRemainingInteractions: questionQueue.length,
    readyForMatching: false,
    checkpointShown: false,
    checkpointDismissed: false,
  };
}

// ── Get current axis ──

/**
 * Get the current axis ID to present to the user.
 * Returns null if the session is complete.
 */
export function getCurrentAxis(session: HybridAssessmentSession): string | null {
  if (session.readyForMatching) return null;
  if (session.questionQueue.length === 0) return null;
  return session.questionQueue[0] ?? null;
}

// ── Process structured card selection ──

/**
 * Process a structured card selection and return the updated session.
 */
export function processStructuredSelection(
  session: HybridAssessmentSession,
  axisId: string,
  selectedValue: number, // 0, 2.5, 5.0, 7.5, or 10.0
  dwellTimeMs: number,
  ballotWeights: BallotRelevanceWeights = {},
): HybridAssessmentSession {
  const updated = deepCloneSession(session);
  const axis = updated.axes[axisId];
  if (!axis) return updated;

  // Compute entropy-hybrid confidence
  const entropyResult = entropyConfidenceStructured(
    selectedValue,
    axis.importance ?? undefined,
    dwellTimeMs,
  );
  const heuristicConf = cardHeuristicConfidence(selectedValue);
  const hybridConf = ALPHA_STRUCTURED * entropyResult.confidence
    + (1 - ALPHA_STRUCTURED) * heuristicConf;

  // Build posteriors map for engine operations
  const posteriors = rebuildPosteriorMap(updated);

  // Apply Bayesian update
  const prior = posteriors.get(axisId)!;
  const updatedPosterior = updateFromStructured(prior, selectedValue, axis.importance ?? undefined, dwellTimeMs);
  posteriors.set(axisId, updatedPosterior);

  // Cross-axis propagation
  propagateCrossAxis(posteriors, axisId);

  // Write posteriors back to axis states
  syncPosteriorsToAxes(updated, posteriors);

  // Build UserValueRecord
  axis.currentRecord = {
    axisId,
    score: selectedValue,
    scoreNormalized: (selectedValue - 5.0) / 5.0,
    confidence: hybridConf,
    coverageStatus: 'answered',
    isImputed: false,
    sourceModality: 'structured',
    cardPosition: selectedValue,
    recordedAt: Date.now(),
  };

  // Update modality tracking
  axis.modalityRecord.modality = 'structured';
  axis.modalityRecord.structuredSelection = selectedValue;
  axis.confidenceByModality.structuredConfidence = hybridConf;
  axis.confidenceByModality.mergedConfidence = hybridConf;
  axis.coverageStatus = 'covered';

  // Update session-level state
  if (!updated.answeredAxes.includes(axisId)) {
    updated.answeredAxes.push(axisId);
  }
  if (!updated.confirmedAxes.includes(axisId)) {
    updated.confirmedAxes.push(axisId);
  }
  updated.interactionCount++;
  updated.totalStructuredInteractions++;

  // Track consecutive neutrals for T3 trigger
  if (selectedValue === 5.0) {
    updated.consecutiveNeutrals++;
  } else {
    updated.consecutiveNeutrals = 0;
  }

  // Recompute question queue and stopping
  recomputeSessionState(updated, posteriors, ballotWeights);

  return updated;
}

// ── Process NLP signals ──

/**
 * Process classified signals from an NLP extraction.
 *
 * The primary signal is applied immediately. Secondary signals
 * are stored as pending and require user confirmation. Spillover
 * signals are applied as soft evidence.
 *
 * Returns the updated session and an optional confirmation card.
 */
export function processNlpSignals(
  session: HybridAssessmentSession,
  askedAxis: string,
  classifiedSignals: ClassifiedSignal[],
  ballotWeights: BallotRelevanceWeights = {},
  getPositionLabel: (axisId: string, score: number) => string = defaultPositionLabel,
): { session: HybridAssessmentSession; confirmationCard: ConfirmationCard | null } {
  const updated = deepCloneSession(session);
  const posteriors = rebuildPosteriorMap(updated);

  const primarySignals = classifiedSignals.filter((s) => s.strength === 'primary');
  const secondarySignals = classifiedSignals.filter((s) => s.strength === 'secondary');
  const spilloverSignals = classifiedSignals.filter((s) => s.strength === 'spillover');

  // Apply primary signals (always confirmed)
  for (const signal of primarySignals) {
    applySignalToAxis(updated, posteriors, signal, true);
    if (!updated.answeredAxes.includes(signal.axisId)) {
      updated.answeredAxes.push(signal.axisId);
    }
    if (!updated.confirmedAxes.includes(signal.axisId)) {
      updated.confirmedAxes.push(signal.axisId);
    }
  }

  // Apply spillover as soft evidence (never shown to user)
  for (const signal of spilloverSignals) {
    applySignalToAxis(updated, posteriors, signal, false);
  }

  // Cross-axis propagation from primary signals
  for (const signal of primarySignals) {
    propagateCrossAxis(posteriors, signal.axisId);
  }

  // Sync posteriors back
  syncPosteriorsToAxes(updated, posteriors);

  updated.interactionCount++;
  updated.totalNlpInteractions++;
  updated.consecutiveNeutrals = 0; // NLP input breaks the neutral streak

  // Store pending secondary signals
  updated.pendingSecondarySignals = secondarySignals;

  // Build confirmation card if there are secondary signals
  const confirmationCard = buildConfirmationCard(classifiedSignals, getPositionLabel);

  // Recompute session state
  recomputeSessionState(updated, posteriors, ballotWeights);

  return { session: updated, confirmationCard };
}

// ── Process confirmation of secondary signals ──

/**
 * Process user confirmation of secondary signals from the confirmation card.
 *
 * @param confirmedAxisIds  Axis IDs the user checked (confirmed)
 */
export function processSecondaryConfirmation(
  session: HybridAssessmentSession,
  confirmedAxisIds: string[],
  ballotWeights: BallotRelevanceWeights = {},
): HybridAssessmentSession {
  const updated = deepCloneSession(session);
  const posteriors = rebuildPosteriorMap(updated);
  const confirmedSet = new Set(confirmedAxisIds);

  for (const signal of updated.pendingSecondarySignals) {
    if (confirmedSet.has(signal.axisId)) {
      // User confirmed this secondary signal
      signal.userConfirmed = true;
      applySignalToAxis(updated, posteriors, signal, true);
      if (!updated.answeredAxes.includes(signal.axisId)) {
        updated.answeredAxes.push(signal.axisId);
      }
      if (!updated.confirmedAxes.includes(signal.axisId)) {
        updated.confirmedAxes.push(signal.axisId);
      }
    } else {
      // User did not confirm — treat as soft evidence only
      applySignalToAxis(updated, posteriors, signal, false);
      // Do NOT add to answered — the question will still be asked
    }
  }

  // Cross-axis propagation for confirmed axes
  for (const axisId of confirmedAxisIds) {
    propagateCrossAxis(posteriors, axisId);
  }

  syncPosteriorsToAxes(updated, posteriors);

  // Clear pending signals
  updated.pendingSecondarySignals = [];

  // Recompute session state
  recomputeSessionState(updated, posteriors, ballotWeights);

  return updated;
}

// ── Skip axis ──

/**
 * Skip the current axis. The user explicitly chose not to answer.
 */
export function skipAxis(
  session: HybridAssessmentSession,
  axisId: string,
  ballotWeights: BallotRelevanceWeights = {},
): HybridAssessmentSession {
  const updated = deepCloneSession(session);
  if (!updated.skippedAxes.includes(axisId)) {
    updated.skippedAxes.push(axisId);
  }

  const posteriors = rebuildPosteriorMap(updated);
  recomputeSessionState(updated, posteriors, ballotWeights);

  return updated;
}

// ── Record modality switch ──

/**
 * Record a modality switch event.
 */
export function recordModalitySwitch(
  session: HybridAssessmentSession,
  switchEvent: ModalitySwitch,
): HybridAssessmentSession {
  const updated = deepCloneSession(session);
  updated.modalitySwitchLog.push(switchEvent);

  // Update default modality based on user preference
  if (switchEvent.to === 'nlp') {
    updated.defaultModality = 'nlp';
  } else if (switchEvent.to === 'structured') {
    updated.defaultModality = 'structured';
  }

  // Also record on the axis's switch history
  const currentAxisId = getCurrentAxis(updated);
  if (currentAxisId && updated.axes[currentAxisId]) {
    updated.axes[currentAxisId].modalityRecord.switchHistory.push(switchEvent);
  }

  return updated;
}

// ── Evaluate stopping ──

/**
 * Evaluate whether the hybrid session should stop.
 */
export function evaluateHybridStopping(
  session: HybridAssessmentSession,
  ballotWeights: BallotRelevanceWeights = {},
): HybridStoppingDecision {
  const answeredSet = new Set(session.answeredAxes);

  // Checkpoint: at CHECKPOINT_QUESTIONS, if user hasn't seen/dismissed yet
  const shouldCheckpoint = session.interactionCount >= CHECKPOINT_QUESTIONS
    && !session.checkpointShown
    && !session.checkpointDismissed;

  // Hard minimum
  if (session.interactionCount < 5) {
    return {
      shouldStop: false,
      shouldCheckpoint: false,
      reason: 'minimum_not_reached',
      interactionCount: session.interactionCount,
      sessionEntropy: session.sessionEntropy,
      entropyFraction: 1,
    };
  }

  // Hard ceiling
  if (session.interactionCount >= session.maxInteractions) {
    return {
      shouldStop: true,
      shouldCheckpoint: false,
      reason: 'max_interactions',
      interactionCount: session.interactionCount,
      sessionEntropy: session.sessionEntropy,
      entropyFraction: 0,
    };
  }

  // All answered
  if (answeredSet.size >= AXIS_IDS.length) {
    return {
      shouldStop: true,
      shouldCheckpoint: false,
      reason: 'all_answered',
      interactionCount: session.interactionCount,
      sessionEntropy: 0,
      entropyFraction: 0,
    };
  }

  // Use the posteriorEngine stopping evaluator
  const posteriors = rebuildPosteriorMap(session);
  const stopping = evaluateStopping(answeredSet, posteriors, ballotWeights);

  return {
    shouldStop: stopping.shouldStop,
    shouldCheckpoint,
    reason: stopping.shouldStop ? stopping.reason as HybridStoppingDecision['reason'] : 'continue',
    interactionCount: session.interactionCount,
    sessionEntropy: stopping.totalWeightedEntropy,
    entropyFraction: stopping.entropyFraction,
  };
}

// ── Get imputed values ──

/**
 * Get imputed values for unanswered axes that have enough cross-axis
 * information to estimate.
 */
export function getImputedValues(
  session: HybridAssessmentSession,
): UserValueRecord[] {
  const posteriors = rebuildPosteriorMap(session);
  const answeredSet = new Set(session.answeredAxes);
  const imputed = imputeUnansweredAxes(answeredSet, posteriors);

  return imputed.map((iv) => ({
    axisId: iv.axisId,
    score: iv.value,
    scoreNormalized: (iv.value - 5.0) / 5.0,
    confidence: iv.confidence,
    coverageStatus: 'imputed' as const,
    isImputed: true,
    imputationSource: iv.imputationSources,
    sourceModality: 'imputed' as const,
    recordedAt: Date.now(),
  }));
}

// ── Get full profile ──

/**
 * Build the complete profile from answered + imputed axes.
 * Returns all 17 axes with the best available record.
 */
export function getFullProfile(
  session: HybridAssessmentSession,
): Record<string, UserValueRecord> {
  const profile: Record<string, UserValueRecord> = {};
  const imputedValues = getImputedValues(session);
  const imputedMap = new Map(imputedValues.map((v) => [v.axisId, v]));

  for (const axisId of AXIS_IDS) {
    const axis = session.axes[axisId];

    if (axis?.currentRecord) {
      profile[axisId] = axis.currentRecord;
    } else if (imputedMap.has(axisId)) {
      profile[axisId] = imputedMap.get(axisId)!;
    } else {
      // Uncovered axis — still provide a record with low confidence
      profile[axisId] = {
        axisId,
        score: axis?.pointEstimate ?? 5.0,
        scoreNormalized: ((axis?.pointEstimate ?? 5.0) - 5.0) / 5.0,
        confidence: 0,
        coverageStatus: 'uncovered',
        isImputed: false,
        sourceModality: 'structured',
        recordedAt: Date.now(),
      };
    }
  }

  return profile;
}

// ── Progress estimation ──

/**
 * Get assessment progress as a percentage (0-100).
 */
export function getProgress(
  session: HybridAssessmentSession,
  ballotWeights: BallotRelevanceWeights = {},
): number {
  const posteriors = rebuildPosteriorMap(session);
  return estimateProgress(posteriors, ballotWeights);
}

// ── Fine-tuning refinement ──

/**
 * Process fine-tuning sub-dimension responses to narrow the posterior on a parent axis.
 *
 * Each sub-dimension response is an additional Bayesian observation that tightens
 * the posterior around the user's true position. Does NOT count as a separate
 * interaction for stopping purposes — it refines an already-answered axis.
 *
 * @param session     Current session state
 * @param axisId      Parent axis being refined
 * @param responses   Map of subDimensionId → positionIndex (0-based)
 * @param positionCounts  Map of subDimensionId → number of positions (for score conversion)
 * @param ballotWeights  Ballot relevance weights
 * @returns Updated session with narrowed posterior and higher confidence
 */
export function processFineTuningRefinement(
  session: HybridAssessmentSession,
  axisId: string,
  responses: Record<string, number>,
  positionCounts: Record<string, number>,
  ballotWeights: BallotRelevanceWeights = {},
): HybridAssessmentSession {
  const updated = deepCloneSession(session);
  const axis = updated.axes[axisId];
  if (!axis) return updated;

  const posteriors = rebuildPosteriorMap(updated);
  const prior = posteriors.get(axisId);
  if (!prior) return updated;

  let currentPosterior = prior;
  let responseCount = 0;

  for (const [subId, positionIndex] of Object.entries(responses)) {
    const count = positionCounts[subId] ?? 5;
    // Convert position index to 0-10 scale
    const value = count <= 1 ? 5 : (positionIndex / (count - 1)) * 10;
    // Sub-dimension signals use a moderate sigma (1.5) since they're
    // refinements of an already-answered axis, not primary observations.
    // This narrows the posterior without dominating the main card selection.
    const sigma = 1.5;
    currentPosterior = bayesianUpdate(currentPosterior, value, sigma);
    responseCount++;
  }

  posteriors.set(axisId, currentPosterior);

  // Cross-axis propagation from the refined estimate
  propagateCrossAxis(posteriors, axisId);

  // Write posteriors back
  syncPosteriorsToAxes(updated, posteriors);

  // Boost confidence from the additional evidence
  if (responseCount > 0 && axis.currentRecord) {
    // Each sub-dimension response adds evidence; confidence asymptotically approaches 1.0
    const prevConf = axis.confidenceByModality.mergedConfidence;
    const boost = responseCount / (responseCount + 4); // diminishing returns
    const newConf = Math.min(0.98, prevConf + (1 - prevConf) * boost * 0.5);
    axis.confidenceByModality.mergedConfidence = newConf;
    axis.confidenceByModality.structuredConfidence = newConf;
    axis.currentRecord.confidence = newConf;
    // Update score to posterior mean (which has been refined by sub-dimensions)
    axis.currentRecord.score = currentPosterior.mean;
    axis.currentRecord.scoreNormalized = (currentPosterior.mean - 5.0) / 5.0;
  }

  // Recompute session state (question queue, entropy)
  recomputeSessionState(updated, posteriors, ballotWeights);

  return updated;
}

// ── Internal helpers ──

/**
 * Rebuild a PosteriorMap from axis states.
 */
function rebuildPosteriorMap(session: HybridAssessmentSession): PosteriorMap {
  const map: PosteriorMap = new Map();
  for (const axisId of AXIS_IDS) {
    const axis = session.axes[axisId];
    if (axis) {
      const probs = [...axis.posterior];
      const mean = axis.pointEstimate;
      const variance = probs.reduce(
        (s, p, i) => s + (i * 0.5 - mean) ** 2 * p,
        0,
      );
      map.set(axisId, {
        probs,
        mean,
        variance,
        entropy: axis.entropy,
      });
    }
  }
  return map;
}

/**
 * Sync posteriors from the engine back to axis states.
 */
function syncPosteriorsToAxes(
  session: HybridAssessmentSession,
  posteriors: PosteriorMap,
): void {
  for (const [axisId, posterior] of posteriors) {
    const axis = session.axes[axisId];
    if (axis) {
      axis.posterior = [...posterior.probs];
      axis.entropy = posterior.entropy;
      axis.pointEstimate = posterior.mean;
    }
  }
}

/**
 * Apply a classified signal to an axis.
 */
function applySignalToAxis(
  session: HybridAssessmentSession,
  posteriors: PosteriorMap,
  signal: ClassifiedSignal,
  isConfirmed: boolean,
): void {
  const axis = session.axes[signal.axisId];
  if (!axis) return;

  const prior = posteriors.get(signal.axisId);
  if (!prior) return;

  // Bayesian update with appropriate damping for spillover
  const damping = signal.strength === 'spillover' ? Math.abs(signal.hybridConfidence) : 1.0;
  const updated = updateFromNLP(
    prior,
    signal.rawSignal.direction,
    signal.rawSignal.confidence,
    damping,
  );
  posteriors.set(signal.axisId, updated);

  // Update axis state
  axis.posterior = [...updated.probs];
  axis.entropy = updated.entropy;
  axis.pointEstimate = updated.mean;

  // Update confidence tracking
  axis.confidenceByModality.nlpConfidence = signal.hybridConfidence;
  axis.confidenceByModality.mergedConfidence = signal.hybridConfidence;

  // Update coverage
  if (isConfirmed && signal.hybridConfidence >= 0.50) {
    axis.coverageStatus = 'covered';
  } else if (signal.hybridConfidence >= 0.25) {
    axis.coverageStatus = axis.coverageStatus === 'uncovered' ? 'partial' : axis.coverageStatus;
  } else {
    axis.coverageStatus = axis.coverageStatus === 'uncovered' ? 'soft_only' : axis.coverageStatus;
  }

  // Build UserValueRecord if confirmed
  if (isConfirmed) {
    axis.currentRecord = {
      axisId: signal.axisId,
      score: signal.rawSignal.direction,
      scoreNormalized: (signal.rawSignal.direction - 5.0) / 5.0,
      confidence: signal.hybridConfidence,
      coverageStatus: 'answered',
      isImputed: false,
      sourceModality: 'nlp',
      nlpSourceText: signal.rawSignal.source,
      nlpReasoning: signal.rawSignal.reasoning,
      signalStrength: signal.strength,
      recordedAt: Date.now(),
    };
  }

  // Update modality record
  axis.modalityRecord.modality = 'nlp';
  axis.modalityRecord.nlpTurnCount++;

  // Store signal in history
  axis.signalHistory.push(signal);

  // Store evidence quote
  if (signal.rawSignal.source) {
    axis.evidenceQuotes.push(signal.rawSignal.source);
  }
}

/**
 * Recompute question queue, session entropy, and stopping decision.
 */
function recomputeSessionState(
  session: HybridAssessmentSession,
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
): void {
  const answeredSet = new Set(session.answeredAxes);
  const skippedSet = new Set(session.skippedAxes);

  // Compute unanswered axes (excluding skipped)
  const excludeSet = new Set([...answeredSet, ...skippedSet]);

  // Session entropy
  session.sessionEntropy = totalWeightedEntropy(posteriors, ballotWeights, answeredSet);

  // Build new question queue from unanswered, non-skipped axes
  const unanswered = AXIS_IDS.filter(
    (id) => !answeredSet.has(id) && !skippedSet.has(id),
  );

  if (unanswered.length === 0) {
    session.questionQueue = [];
    session.readyForMatching = true;
    session.estimatedRemainingInteractions = 0;
    return;
  }

  // Check stopping criterion
  const stopping = evaluateStopping(answeredSet, posteriors, ballotWeights);
  if (stopping.shouldStop) {
    session.questionQueue = [];
    session.readyForMatching = true;
    session.estimatedRemainingInteractions = 0;
    return;
  }

  // Rebuild queue using adaptive sequencer
  // Get recent domains for diversity bonus
  const recentDomains = getRecentDomains(session);
  session.questionQueue = computeQuestionQueue(
    posteriors,
    ballotWeights,
    answeredSet,
    recentDomains,
  );
  session.estimatedRemainingInteractions = stopping.estimatedRemaining;
  session.readyForMatching = false;
}

/**
 * Compute a full question queue ordered by EWIG.
 */
function computeQuestionQueue(
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
  answeredAxes: Set<string>,
  recentDomains: string[],
): string[] {
  const queue: string[] = [];
  const tempAnswered = new Set(answeredAxes);

  // Use selectNextAxis iteratively to build the full queue
  const unanswered = AXIS_IDS.filter((id) => !tempAnswered.has(id));
  for (let i = 0; i < unanswered.length; i++) {
    try {
      const next = selectNextAxis(tempAnswered, posteriors, ballotWeights, recentDomains);
      queue.push(next);
      tempAnswered.add(next);
    } catch {
      // All axes answered or error — stop building queue
      break;
    }
  }

  return queue;
}

/**
 * Get the domains of the last N answered axes.
 */
function getRecentDomains(session: HybridAssessmentSession, count = 2): string[] {
  const answered = session.answeredAxes;
  return answered
    .slice(-count)
    .map((axisId) => {
      if (axisId.startsWith('econ_')) return 'econ';
      if (axisId.startsWith('health_')) return 'health';
      if (axisId.startsWith('housing_')) return 'housing';
      if (axisId.startsWith('justice_')) return 'justice';
      if (axisId.startsWith('climate_')) return 'climate';
      return 'unknown';
    });
}

/**
 * Heuristic confidence for structured card positions.
 * Extreme positions = higher confidence.
 */
function cardHeuristicConfidence(value: number): number {
  const dist = Math.abs(value - 5.0);
  if (dist >= 4.0) return 0.90; // 0 or 10
  if (dist >= 2.0) return 0.80; // 2.5 or 7.5
  return 0.70;                   // 5.0 (neutral)
}

/**
 * Default position label when no axis spec is available.
 */
function defaultPositionLabel(_axisId: string, score: number): string {
  if (score <= 1.25) return 'Strong A';
  if (score <= 3.75) return 'Lean A';
  if (score <= 6.25) return 'Balanced';
  if (score <= 8.75) return 'Lean B';
  return 'Strong B';
}

/**
 * Deep clone a session (using structuredClone for simplicity).
 */
function deepCloneSession(session: HybridAssessmentSession): HybridAssessmentSession {
  return structuredClone(session);
}
