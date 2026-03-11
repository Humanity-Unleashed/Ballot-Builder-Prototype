/**
 * Posterior Engine — 21-bin Bayesian updates and cross-axis propagation.
 *
 * Maintains discretized posterior distributions over each of the 16 civic axes.
 * Supports direct observation updates (from structured cards or NLP signals)
 * and cross-axis propagation via the correlation matrix.
 *
 * Reference: research/02_adaptive_sequencing.md Sections 3-4
 *            research/06_entropy_confidence.md Section 3
 */

import {
  N_BINS,
  getBinCenters,
  shannonEntropy,
  gaussianPosterior,
  uniformPosterior,
  structuredSigma,
  structuredNeutralSigma,
  llmConfidenceToSigma,
} from './entropyConfidence';
import {
  AXIS_IDS,
  CORRELATION_MATRIX,
  N_AXES,
} from './correlationMatrix';

// ── Types ──

export interface AxisPosterior {
  /** Probability distribution over 21 bins (0, 0.5, 1.0, ..., 10.0) */
  probs: number[];
  /** Posterior mean (expected axis value, 0-10) */
  mean: number;
  /** Posterior variance */
  variance: number;
  /** Shannon entropy in bits */
  entropy: number;
}

/** Map of axis ID → posterior */
export type PosteriorMap = Map<string, AxisPosterior>;

// ── Construction helpers ──

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function posteriorFromProbs(probs: number[]): AxisPosterior {
  const bins = getBinCenters();
  const mean = bins.reduce((s, x, i) => s + x * probs[i], 0);
  const variance = bins.reduce((s, x, i) => s + (x - mean) ** 2 * probs[i], 0);
  return {
    probs,
    mean,
    variance,
    entropy: shannonEntropy(probs),
  };
}

/** Create a uniform (no-information) posterior. */
export function createUniformPosterior(): AxisPosterior {
  return posteriorFromProbs(uniformPosterior());
}

/** Initialize posteriors for all 16 axes as uniform. */
export function initializePosteriors(): PosteriorMap {
  const map: PosteriorMap = new Map();
  for (const axisId of AXIS_IDS) {
    map.set(axisId, createUniformPosterior());
  }
  return map;
}

/**
 * Initialize posteriors from a returning user's stored profile.
 * Each entry is { value: 0-10, confidence: 0-1 }.
 */
export function initializeFromProfile(
  profile: Record<string, { value: number; confidence: number }>,
): PosteriorMap {
  const map = initializePosteriors();
  for (const [axisId, { value, confidence }] of Object.entries(profile)) {
    if (!map.has(axisId)) continue;
    // Reconstruct a posterior from the stored value and confidence.
    // Higher confidence → tighter sigma.
    const sigma = Math.max(0.5, 4.0 * (1 - confidence));
    const probs = gaussianPosterior(value, sigma);
    map.set(axisId, posteriorFromProbs(probs));
  }
  return map;
}

// ── Bayesian updates ──

/**
 * Apply a Gaussian likelihood update to a 21-bin posterior.
 *
 * @param prior     Current posterior for the axis
 * @param center    Observed/estimated value (0-10)
 * @param sigma     Observation uncertainty (lower = more precise)
 * @param damping   Optional damping factor in [0, 1]. 1 = full update, < 1 = blend toward prior.
 *                  Used for spillover signals from cross-axis propagation.
 * @returns Updated posterior
 */
export function bayesianUpdate(
  prior: AxisPosterior,
  center: number,
  sigma: number,
  damping = 1.0,
): AxisPosterior {
  const bins = getBinCenters();

  // Construct Gaussian likelihood
  const likelihood = bins.map((x) => Math.exp(-0.5 * ((x - center) / sigma) ** 2));
  const lSum = likelihood.reduce((a, b) => a + b, 0);
  if (lSum === 0) return prior;
  const normLikelihood = likelihood.map((v) => v / lSum);

  // Optionally damp: blend likelihood with uniform (reduces update strength)
  const dampedLikelihood = damping < 1.0
    ? normLikelihood.map((v) => damping * v + (1 - damping) / N_BINS)
    : normLikelihood;

  // Bayesian update: posterior ∝ prior × likelihood
  const unnorm = prior.probs.map((p, i) => p * dampedLikelihood[i]);
  const total = unnorm.reduce((a, b) => a + b, 0);
  if (total === 0) return prior;
  const probs = unnorm.map((v) => v / total);

  return posteriorFromProbs(probs);
}

/**
 * Update a posterior from a structured card selection.
 *
 * @param prior          Current posterior for the axis
 * @param selectedValue  The card value (0, 2.5, 5.0, 7.5, or 10.0)
 * @param importanceRating Optional self-reported importance (0-10)
 * @param dwellTimeMs    Optional time spent before selecting (ms)
 */
export function updateFromStructured(
  prior: AxisPosterior,
  selectedValue: number,
  importanceRating?: number,
  dwellTimeMs?: number,
): AxisPosterior {
  const isNeutral = Math.abs(selectedValue - 5.0) < 2.0;
  const sigma = isNeutral
    ? structuredNeutralSigma(importanceRating, dwellTimeMs)
    : structuredSigma(selectedValue);
  return bayesianUpdate(prior, selectedValue, sigma);
}

/**
 * Update a posterior from an NLP extraction signal.
 *
 * @param prior          Current posterior for the axis
 * @param direction      Extracted axis value (0-10)
 * @param llmConfidence  LLM's reported confidence (0-1)
 * @param damping        Optional damping for secondary/spillover signals
 */
export function updateFromNLP(
  prior: AxisPosterior,
  direction: number,
  llmConfidence: number,
  damping = 1.0,
): AxisPosterior {
  const sigma = llmConfidenceToSigma(llmConfidence);
  return bayesianUpdate(prior, direction, sigma, damping);
}

// ── Cross-axis propagation ──

/**
 * After updating one axis, propagate information to all correlated axes.
 *
 * Uses the conditional expectation shift from the correlation matrix:
 * E[X_i | X_j = x_j] ≈ μ_i + ρ × (σ_i / σ_j) × (x_j - μ_prior_j)
 *
 * The update is damped by |ρ| to prevent overconfidence from weak correlations.
 *
 * @param posteriors      All axis posteriors (modified in place)
 * @param updatedAxisId   The axis that was just directly updated
 */
export function propagateCrossAxis(
  posteriors: PosteriorMap,
  updatedAxisId: string,
): void {
  const jIdx = AXIS_IDS.indexOf(updatedAxisId as typeof AXIS_IDS[number]);
  if (jIdx === -1) return;

  const observed = posteriors.get(updatedAxisId)!;
  const observedMean = observed.mean;
  const observedStd = Math.sqrt(observed.variance);

  for (let i = 0; i < N_AXES; i++) {
    if (i === jIdx) continue;

    const axisId = AXIS_IDS[i];
    const prior = posteriors.get(axisId)!;
    const rho = CORRELATION_MATRIX[i][jIdx];

    // Skip negligible correlations
    if (Math.abs(rho) < 0.10) continue;

    const priorMean = prior.mean;
    const priorStd = Math.sqrt(prior.variance);

    // Conditional mean shift: shift toward where the correlation predicts
    // The "prior mean of the observed axis" for a uniform prior is 5.0
    const shift = rho * (priorStd / Math.max(observedStd, 0.01)) * (observedMean - 5.0);
    const conditionalMean = clamp(priorMean + shift, 0, 10);

    // Conditional variance reduction: Var(X_i | X_j) = Var(X_i) × (1 - ρ²)
    const varianceRetention = 1 - rho * rho;
    const pseudoSigma = Math.sqrt(prior.variance * varianceRetention + 0.01);

    // Construct pseudo-likelihood centered on conditional mean
    const bins = getBinCenters();
    const pseudoLikelihood = bins.map((x) => {
      const z = (x - conditionalMean) / pseudoSigma;
      return Math.exp(-0.5 * z * z);
    });
    const plSum = pseudoLikelihood.reduce((a, b) => a + b, 0);
    if (plSum === 0) continue;
    const normPL = pseudoLikelihood.map((v) => v / plSum);

    // Damped Bayesian update: blend pseudo-likelihood with uniform
    // Damping factor = |ρ| ensures weak correlations produce weak updates
    const dampingFactor = Math.abs(rho);
    const blended = normPL.map((v) => dampingFactor * v + (1 - dampingFactor) / N_BINS);

    // Apply update
    const unnorm = prior.probs.map((p, k) => p * blended[k]);
    const total = unnorm.reduce((a, b) => a + b, 0);
    if (total === 0) continue;
    const probs = unnorm.map((v) => v / total);

    posteriors.set(axisId, posteriorFromProbs(probs));
  }
}

// ── Summary helpers ──

/** Compute total weighted entropy across all axes. */
export function totalWeightedEntropy(
  posteriors: PosteriorMap,
  weights: Record<string, number>,
  excludeAxes?: Set<string>,
): number {
  let total = 0;
  for (const [axisId, posterior] of posteriors) {
    if (excludeAxes?.has(axisId)) continue;
    const w = weights[axisId] ?? 1.0;
    total += w * posterior.entropy;
  }
  return total;
}

/** Maximum possible weighted entropy (all axes uniform). */
export function maxWeightedEntropy(
  weights: Record<string, number>,
  excludeAxes?: Set<string>,
): number {
  const hMax = shannonEntropy(uniformPosterior());
  let total = 0;
  for (const axisId of AXIS_IDS) {
    if (excludeAxes?.has(axisId)) continue;
    const w = weights[axisId] ?? 1.0;
    total += w * hMax;
  }
  return total;
}

/**
 * Deep-clone a PosteriorMap (for hypothetical simulations).
 */
export function clonePosteriors(posteriors: PosteriorMap): PosteriorMap {
  const clone: PosteriorMap = new Map();
  for (const [key, val] of posteriors) {
    clone.set(key, {
      ...val,
      probs: [...val.probs],
    });
  }
  return clone;
}
