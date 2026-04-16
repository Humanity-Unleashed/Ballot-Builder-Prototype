/**
 * Adaptive Sequencer — Information-theoretic question ordering.
 *
 * Selects the next axis to ask about using Expected Weighted Information Gain (EWIG),
 * evaluates stopping criteria based on entropy reduction, and imputes unanswered axes
 * from cross-axis correlations.
 *
 * Reference: research/02_adaptive_sequencing.md Sections 5-7
 */

import {
  AXIS_IDS,
  CORRELATION_MATRIX,
  getDomainForAxis,
} from './correlationMatrix';
import {
  N_BINS,
  shannonEntropy,
  uniformPosterior,
  structuredSigma,
  getBinCenters,
  gaussianPosterior,
} from './entropyConfidence';
import {
  type PosteriorMap,
  type AxisPosterior,
  clonePosteriors,
  bayesianUpdate,
  propagateCrossAxis,
  totalWeightedEntropy,
  maxWeightedEntropy,
} from './posteriorEngine';

// ── Types ──

export interface BallotRelevanceWeights {
  /** Per-axis importance weight from the user's actual ballot.
   *  Higher = this axis appears in more/higher-profile races.
   *  Default 1.0 for all if no ballot loaded. */
  [axisId: string]: number;
}

export interface StoppingDecision {
  shouldStop: boolean;
  reason: 'entropy_floor' | 'marginal_gain_low' | 'all_answered' | 'continue';
  questionsAnswered: number;
  totalWeightedEntropy: number;
  entropyFraction: number;
  bestNextAxisGain: number;
  estimatedRemaining: number;
}

export interface ImputedValue {
  axisId: string;
  /** Imputed axis value (0-10) */
  value: number;
  /** Imputed confidence (capped at 0.75) */
  confidence: number;
  isImputed: true;
  /** Which answered axes drove this imputation */
  imputationSources: string[];
  /** How much entropy was reduced (0-1) */
  entropyReductionRatio: number;
}

// ── Constants ──

/** Anchor axes: first questions are fixed for UX stability. */
export const ANCHOR_AXES = [
  'health_coverage_model',   // High-salience, clear framing
  'justice_firearms',        // Cross-cutting, not left-right predictable
  'justice_reproductive',    // High-salience, poorly predicted by other axes despite correlations
  'climate_ambition',        // High public interest, moderately correlated
  'housing_supply_zoning',   // Cross-cutting (YIMBY/NIMBY is bipartisan)
] as const;

/** Hard minimum number of questions before stopping is allowed. */
const MIN_QUESTIONS = 5;

/** Number of questions at which we offer a checkpoint (quick mode breakpoint). */
export const CHECKPOINT_QUESTIONS = 7;

/** Entropy floor: stop when remaining entropy is below this fraction of max. */
const ENTROPY_FLOOR = 0.20;

/** Marginal gain threshold: stop when best next question gains less than this fraction. */
const MARGINAL_GAIN_THRESHOLD = 0.05;

/** Minimum entropy reduction ratio for imputation (40%). */
const IMPUTATION_THRESHOLD = 0.40;

/** Maximum imputed confidence. */
const IMPUTATION_MAX_CONF = 0.75;

// ── Card position values for simulation ──

const CARD_VALUES = [0, 2.5, 5.0, 7.5, 10.0];

/** Heuristic confidence for each card position (extreme = more precise). */
function cardConfidence(posIdx: number): number {
  return [0.90, 0.80, 0.70, 0.80, 0.90][posIdx];
}

// ── EWIG computation ──

/**
 * Compute Expected Weighted Information Gain for asking a specific axis.
 *
 * Simulates all 5 possible card responses, weighted by their current
 * probability under the prior, and measures how much total weighted
 * entropy would decrease across all axes (including cross-axis propagation).
 */
function computeEWIG(
  candidateAxisId: string,
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
  answeredAxes: Set<string>,
): number {
  const candidatePrior = posteriors.get(candidateAxisId);
  if (!candidatePrior) return 0;

  // Current total weighted entropy (unanswered axes only)
  const currentEntropy = totalWeightedEntropy(posteriors, ballotWeights, answeredAxes);

  // Direct gain: the candidate axis's own entropy × weight will drop to ~0
  const directGain = (ballotWeights[candidateAxisId] ?? 1.0) * candidatePrior.entropy;

  // For each possible card response, simulate the update and measure
  // remaining entropy on other unanswered axes.
  let expectedPostEntropy = 0;

  // Map the 21-bin prior to 5 card positions by summing nearby bins
  const cardProbs = mapTo5CardProbabilities(candidatePrior.probs);

  for (let posIdx = 0; posIdx < 5; posIdx++) {
    const responseProb = cardProbs[posIdx];
    if (responseProb < 0.001) continue;

    const value = CARD_VALUES[posIdx];
    const sigma = structuredSigma(value);

    // Simulate: clone posteriors, apply update + propagation
    const hypothetical = clonePosteriors(posteriors);
    const prior = hypothetical.get(candidateAxisId)!;
    hypothetical.set(candidateAxisId, bayesianUpdate(prior, value, sigma));
    propagateCrossAxis(hypothetical, candidateAxisId);

    // Measure post-update entropy on remaining unanswered axes (excluding the candidate)
    const excludeSet = new Set(answeredAxes);
    excludeSet.add(candidateAxisId);
    const postEntropy = totalWeightedEntropy(hypothetical, ballotWeights, excludeSet);

    expectedPostEntropy += responseProb * postEntropy;
  }

  // Total EWIG = direct gain + cross-axis gain
  return directGain + (currentEntropy - expectedPostEntropy);
}

/**
 * Map a 21-bin posterior to 5 card position probabilities.
 * Each card position covers bins within ±1.25 of its center.
 */
function mapTo5CardProbabilities(probs21: number[]): number[] {
  const bins = getBinCenters();
  const cardProbs = [0, 0, 0, 0, 0];

  for (let b = 0; b < probs21.length; b++) {
    const binVal = bins[b];
    // Find closest card position
    let bestCard = 0;
    let bestDist = Math.abs(binVal - CARD_VALUES[0]);
    for (let c = 1; c < 5; c++) {
      const dist = Math.abs(binVal - CARD_VALUES[c]);
      if (dist < bestDist) {
        bestDist = dist;
        bestCard = c;
      }
    }
    cardProbs[bestCard] += probs21[b];
  }

  return cardProbs;
}

// ── Next-axis selection ──

/**
 * Select the next axis to ask about.
 *
 * Respects the anchor order for the first 4 questions, then uses EWIG
 * with a domain-diversity bonus.
 */
export function selectNextAxis(
  answeredAxes: Set<string>,
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
  recentDomains: string[] = [],
): string {
  const questionNum = answeredAxes.size;

  // Anchor phase: first 4 questions are fixed
  if (questionNum < ANCHOR_AXES.length) {
    const anchor = ANCHOR_AXES[questionNum];
    if (!answeredAxes.has(anchor)) return anchor;
    // If somehow already answered, fall through to EWIG
  }

  const unanswered = AXIS_IDS.filter((id) => !answeredAxes.has(id));
  if (unanswered.length === 0) {
    throw new Error('All axes have been answered');
  }

  let bestAxis = unanswered[0];
  let bestScore = -Infinity;

  for (const candidateAxis of unanswered) {
    let ewig = computeEWIG(candidateAxis, posteriors, ballotWeights, answeredAxes);

    // Domain diversity bonus: if the last 2 questions were the same domain,
    // give a 10% bonus for switching
    const domain = getDomainForAxis(candidateAxis);
    if (
      recentDomains.length >= 2 &&
      recentDomains[recentDomains.length - 1] === recentDomains[recentDomains.length - 2]
    ) {
      if (domain !== recentDomains[recentDomains.length - 1]) {
        ewig *= 1.10;
      }
    }

    if (ewig > bestScore) {
      bestScore = ewig;
      bestAxis = candidateAxis;
    }
  }

  return bestAxis;
}

// ── Stopping criterion ──

/**
 * Evaluate whether the assessment should stop.
 *
 * Criteria:
 * 1. Hard minimum of 5 questions.
 * 2. Entropy floor: remaining weighted entropy < 20% of max.
 * 3. Marginal gain: best next question gains < 5% of remaining entropy.
 */
export function evaluateStopping(
  answeredAxes: Set<string>,
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
): StoppingDecision {
  const questionsAnswered = answeredAxes.size;

  // Hard minimum
  if (questionsAnswered < MIN_QUESTIONS) {
    return {
      shouldStop: false,
      reason: 'continue',
      questionsAnswered,
      totalWeightedEntropy: 0,
      entropyFraction: 1,
      bestNextAxisGain: 0,
      estimatedRemaining: Math.max(0, MIN_QUESTIONS - questionsAnswered),
    };
  }

  // All answered
  if (questionsAnswered >= AXIS_IDS.length) {
    return {
      shouldStop: true,
      reason: 'all_answered',
      questionsAnswered,
      totalWeightedEntropy: 0,
      entropyFraction: 0,
      bestNextAxisGain: 0,
      estimatedRemaining: 0,
    };
  }

  // Compute remaining weighted entropy
  const remaining = totalWeightedEntropy(posteriors, ballotWeights, answeredAxes);
  const maxPossible = maxWeightedEntropy(ballotWeights, answeredAxes);
  const entropyFraction = maxPossible > 0 ? remaining / maxPossible : 0;

  // Criterion 1: Entropy floor
  if (entropyFraction < ENTROPY_FLOOR) {
    return {
      shouldStop: true,
      reason: 'entropy_floor',
      questionsAnswered,
      totalWeightedEntropy: remaining,
      entropyFraction,
      bestNextAxisGain: 0,
      estimatedRemaining: 0,
    };
  }

  // Criterion 2: Marginal gain
  const unanswered = AXIS_IDS.filter((id) => !answeredAxes.has(id));
  let bestGain = 0;
  for (const axis of unanswered) {
    const gain = computeEWIG(axis, posteriors, ballotWeights, answeredAxes);
    if (gain > bestGain) bestGain = gain;
  }

  const marginalFraction = remaining > 0 ? bestGain / remaining : 0;

  if (marginalFraction < MARGINAL_GAIN_THRESHOLD) {
    return {
      shouldStop: true,
      reason: 'marginal_gain_low',
      questionsAnswered,
      totalWeightedEntropy: remaining,
      entropyFraction,
      bestNextAxisGain: bestGain,
      estimatedRemaining: 0,
    };
  }

  // Estimate remaining questions from entropy reduction rate
  const answeredEntropy = maxWeightedEntropy(ballotWeights) - remaining;
  const avgReductionPerQ = questionsAnswered > 0 ? answeredEntropy / questionsAnswered : bestGain;
  const entropyToGo = remaining * (1 - ENTROPY_FLOOR);
  const estimatedRemaining = avgReductionPerQ > 0
    ? Math.ceil(entropyToGo / avgReductionPerQ)
    : unanswered.length;

  return {
    shouldStop: false,
    reason: 'continue',
    questionsAnswered,
    totalWeightedEntropy: remaining,
    entropyFraction,
    bestNextAxisGain: bestGain,
    estimatedRemaining: Math.min(estimatedRemaining, unanswered.length),
  };
}

// ── Imputation ──

/**
 * Impute values for unanswered axes where cross-axis correlations
 * have reduced entropy enough to make a confident estimate.
 *
 * Only imputes when entropy reduction ≥ 40%. Imputed confidence is
 * capped at 0.75 (always below direct-answer confidence of ≥ 0.70
 * for non-neutral selections).
 */
export function imputeUnansweredAxes(
  answeredAxes: Set<string>,
  posteriors: PosteriorMap,
): ImputedValue[] {
  const maxEntropy = shannonEntropy(uniformPosterior());
  const results: ImputedValue[] = [];

  for (const axisId of AXIS_IDS) {
    if (answeredAxes.has(axisId)) continue;

    const posterior = posteriors.get(axisId);
    if (!posterior) continue;

    const entropyReduction = 1 - posterior.entropy / maxEntropy;

    if (entropyReduction < IMPUTATION_THRESHOLD) continue;

    // Confidence: 0.30 at threshold, scaling up to 0.75
    const confidence = Math.min(
      IMPUTATION_MAX_CONF,
      0.30 + (entropyReduction - IMPUTATION_THRESHOLD) * 0.75,
    );

    // Find which answered axes contributed most
    const jIdx = AXIS_IDS.indexOf(axisId as typeof AXIS_IDS[number]);
    const sources: { axisId: string; contribution: number }[] = [];
    for (const answeredId of answeredAxes) {
      const iIdx = AXIS_IDS.indexOf(answeredId as typeof AXIS_IDS[number]);
      if (iIdx === -1) continue;
      const rho = Math.abs(CORRELATION_MATRIX[jIdx][iIdx]);
      if (rho > 0.15) {
        sources.push({ axisId: answeredId, contribution: rho });
      }
    }
    sources.sort((a, b) => b.contribution - a.contribution);

    results.push({
      axisId,
      value: posterior.mean,
      confidence,
      isImputed: true,
      imputationSources: sources.slice(0, 3).map((s) => s.axisId),
      entropyReductionRatio: entropyReduction,
    });
  }

  return results;
}

// ── Progress estimation ──

/**
 * Estimate assessment progress as a percentage (0-100).
 * Based on entropy reduction rather than linear question count.
 */
export function estimateProgress(
  posteriors: PosteriorMap,
  ballotWeights: BallotRelevanceWeights,
): number {
  const current = totalWeightedEntropy(posteriors, ballotWeights);
  const max = maxWeightedEntropy(ballotWeights);
  if (max === 0) return 100;
  const reduction = 1 - current / max;
  // Scale so that the entropy floor (20% remaining) maps to ~90% progress
  // This prevents the bar from jumping to 100% right before the last question
  return Math.min(100, Math.round(reduction * 100 / (1 - ENTROPY_FLOOR) * 0.9 + 10 * (reduction > 0 ? 1 : 0)));
}
