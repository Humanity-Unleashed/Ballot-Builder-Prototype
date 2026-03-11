/**
 * Entropy-based confidence scoring for civic axis posteriors.
 *
 * Replaces/augments heuristic confidence with an information-theoretic measure
 * of how much a user's response narrows the posterior over an axis.
 *
 * Reference: research/06_entropy_confidence.md
 */

// ── Constants ──

/** Number of bins for axis discretization: 0, 0.5, 1.0, ..., 10.0 */
export const N_BINS = 21;

/** Width of each bin on the 0-10 scale */
export const BIN_WIDTH = 10 / (N_BINS - 1); // 0.5

/** Maximum entropy for a uniform 21-bin distribution (bits) */
export const H_MAX = Math.log2(N_BINS); // ~4.392

/** Blending weight for entropy vs heuristic on the structured path */
export const ALPHA_STRUCTURED = 0.35;

/** Blending weight for entropy vs heuristic on the NLP path */
export const ALPHA_NLP = 0.55;

// ── Bin centers (cached) ──

const _binCenters: number[] = Array.from({ length: N_BINS }, (_, i) => i * BIN_WIDTH);

/** Returns the 21 bin center values: [0, 0.5, 1.0, ..., 10.0] */
export function getBinCenters(): number[] {
  return _binCenters;
}

// ── Core math ──

/**
 * Compute Shannon entropy of a discrete probability distribution.
 * @param probs Probability array (must sum to ~1)
 * @returns Entropy in bits
 */
export function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-12) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/**
 * Construct a truncated Gaussian posterior over [0, 10], discretized into N_BINS.
 * @param center Mean of the Gaussian (0-10)
 * @param sigma  Standard deviation (higher = more uncertain)
 * @returns Normalized probability array of length N_BINS
 */
export function gaussianPosterior(center: number, sigma: number): number[] {
  const raw = _binCenters.map((x) => Math.exp(-0.5 * ((x - center) / sigma) ** 2));
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum === 0) return _binCenters.map(() => 1 / N_BINS);
  return raw.map((v) => v / sum);
}

/**
 * Return a uniform (no-information) posterior of length N_BINS.
 */
export function uniformPosterior(): number[] {
  return _binCenters.map(() => 1 / N_BINS);
}

/**
 * Construct a bimodal posterior for contradictory signals.
 * Two Gaussians mixed proportionally by confidence.
 */
export function bimodalPosterior(
  signal1: { direction: number; confidence: number },
  signal2: { direction: number; confidence: number },
): number[] {
  const p1 = gaussianPosterior(signal1.direction, llmConfidenceToSigma(signal1.confidence));
  const p2 = gaussianPosterior(signal2.direction, llmConfidenceToSigma(signal2.confidence));
  const w1 = signal1.confidence;
  const w2 = signal2.confidence;
  const total = w1 + w2;
  const mixed = p1.map((v, i) => (w1 * v + w2 * p2[i]) / total);
  const sum = mixed.reduce((a, b) => a + b, 0);
  return mixed.map((v) => v / sum);
}

// ── Sigma mappings ──

/**
 * Convert LLM extraction confidence (0-1 heuristic) to a posterior sigma.
 * High LLM confidence → tight sigma. Low → wide sigma.
 */
export function llmConfidenceToSigma(llmConf: number): number {
  const clamped = Math.max(0.05, Math.min(0.95, llmConf));
  return Math.max(0.5, 4.0 * (1 - clamped));
}

/**
 * Sigma for structured 5-card selections based on position extremity.
 */
export function structuredSigma(value: number): number {
  const dist = Math.abs(value - 5.0);
  if (dist >= 4.0) return 1.0;  // Strong pole (0 or 10)
  if (dist >= 2.0) return 1.5;  // Moderate (2.5 or 7.5)
  return 3.0;                    // Neutral (5.0) — default wide
}

/**
 * Sigma for neutral structured selection with disambiguation signals.
 * Tightens for genuine centrists, widens for confused/fast selections.
 */
export function structuredNeutralSigma(
  importanceRating?: number,
  dwellTimeMs?: number,
): number {
  let sigma = 3.0;

  // High importance + neutral = genuine centrist → tighter
  if (importanceRating !== undefined && importanceRating >= 6) {
    sigma = Math.max(1.2, sigma - 0.4 * ((importanceRating - 5) / 5));
  }

  // Long dwell time suggests deliberation → slightly tighter
  if (dwellTimeMs !== undefined && dwellTimeMs > 5000) {
    sigma = Math.max(1.0, sigma * 0.85);
  }

  // Very fast selection (< 1.5s) suggests random → wider
  if (dwellTimeMs !== undefined && dwellTimeMs < 1500) {
    sigma = Math.min(4.5, sigma * 1.3);
  }

  return sigma;
}

// ── Confidence results ──

export interface EntropyConfidenceResult {
  /** Entropy-based confidence: 0 (uniform/no information) to 1 (point mass) */
  confidence: number;
  /** Shannon entropy of the posterior in bits */
  entropy: number;
  /** Maximum possible entropy (uniform distribution) in bits */
  entropyMax: number;
  /** The posterior distribution (21 bins) */
  posterior: number[];
  /** Posterior mean (expected axis value, 0-10) */
  posteriorMean: number;
  /** Posterior standard deviation */
  posteriorStd: number;
}

function resultFromPosterior(posterior: number[]): EntropyConfidenceResult {
  const entropy = shannonEntropy(posterior);
  const confidence = Math.max(0, Math.min(1, 1 - entropy / H_MAX));
  const posteriorMean = _binCenters.reduce((s, x, i) => s + x * posterior[i], 0);
  const posteriorVar = _binCenters.reduce(
    (s, x, i) => s + (x - posteriorMean) ** 2 * posterior[i],
    0,
  );
  return {
    confidence,
    entropy,
    entropyMax: H_MAX,
    posterior,
    posteriorMean,
    posteriorStd: Math.sqrt(posteriorVar),
  };
}

/**
 * Entropy-based confidence for a structured card/slider response.
 */
export function entropyConfidenceStructured(
  selectedValue: number,
  importanceRating?: number,
  dwellTimeMs?: number,
): EntropyConfidenceResult {
  const isNeutral = Math.abs(selectedValue - 5.0) < 2.0;
  const sigma = isNeutral
    ? structuredNeutralSigma(importanceRating, dwellTimeMs)
    : structuredSigma(selectedValue);
  return resultFromPosterior(gaussianPosterior(selectedValue, sigma));
}

/**
 * Entropy-based confidence for an NLP extraction signal.
 */
export function entropyConfidenceNLP(
  direction: number,
  llmConfidence: number,
): EntropyConfidenceResult {
  const sigma = llmConfidenceToSigma(llmConfidence);
  return resultFromPosterior(gaussianPosterior(direction, sigma));
}

/**
 * Entropy-based confidence from a raw posterior distribution.
 * Use when you have a custom posterior (e.g., bimodal from contradictions).
 */
export function entropyConfidenceFromPosterior(
  posterior: number[],
): EntropyConfidenceResult {
  if (posterior.length !== N_BINS) {
    throw new Error(`Posterior must have ${N_BINS} bins, got ${posterior.length}`);
  }
  const sum = posterior.reduce((a, b) => a + b, 0);
  const normalized = sum > 0 ? posterior.map((p) => p / sum) : uniformPosterior();
  return resultFromPosterior(normalized);
}

// ── Hybrid confidence ──

export type Modality = 'structured' | 'nlp';

/**
 * Blend entropy confidence with heuristic confidence using modality-specific alpha.
 * alpha = weight of entropy; (1 - alpha) = weight of heuristic.
 */
export function computeHybridConfidence(
  entropyConf: number,
  heuristicConf: number,
  modality: Modality,
): number {
  const alpha = modality === 'structured' ? ALPHA_STRUCTURED : ALPHA_NLP;
  return alpha * entropyConf + (1 - alpha) * heuristicConf;
}
