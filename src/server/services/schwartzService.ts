/**
 * Schwartz Values Scoring Service
 *
 * Implements scoring algorithm for Schwartz Value Survey responses:
 * 1. Convert vignette picks into synthetic item-level responses
 * 2. Calculate raw mean score for each value (sum / count)
 * 3. Optionally apply ipsatization (center on individual mean)
 * 4. Aggregate to dimension level
 */

import {
  schwartzSpec,
  getVignetteItems,
  getAllBoosterItems,
  type SchwartzSpec,
  type Vignette,
} from '../data/schwartzValues';

export interface ItemResponse {
  item_id: string;
  response: 1 | 2 | 3 | 4 | 5; // 5-point Likert
}

export interface VignetteResponse {
  vignette_id: string;
  selected_option_id: string;
}

export interface ValueScore {
  value_id: string;
  name: string;
  raw_mean: number;       // Average response (1-5)
  ipsatized: number;      // Centered on individual mean
  n_answered: number;
  dimension_id: string;
}

export interface DimensionScore {
  dimension_id: string;
  name: string;
  raw_mean: number;
  ipsatized: number;
  values: string[];       // Value IDs in this dimension
}

export interface ScoringResult {
  values: ValueScore[];
  dimensions: DimensionScore[];
  individual_mean: number;  // Used for ipsatization
}

/**
 * Expand vignette picks into synthetic ItemResponse[].
 * Selected option → 5 (strongly agree), non-selected options → 1 (strongly disagree).
 */
export function expandVignetteResponses(vignetteResponses: VignetteResponse[]): ItemResponse[] {
  const synthetic: ItemResponse[] = [];

  for (const vr of vignetteResponses) {
    const vignette = schwartzSpec.vignettes.find((v) => v.id === vr.vignette_id);
    if (!vignette) continue;

    for (const option of vignette.options) {
      synthetic.push({
        item_id: option.id,
        response: option.id === vr.selected_option_id ? 5 : 1,
      });
    }
  }

  return synthetic;
}

/**
 * Score a set of item responses and return value/dimension scores
 */
export function scoreResponses(responses: ItemResponse[]): ScoringResult {
  // Build lookup: item_id -> response
  const responseMap = new Map<string, number>();
  for (const r of responses) {
    responseMap.set(r.item_id, r.response);
  }

  // Calculate raw scores per value
  // Merge vignette-derived items with booster items so boosters are scored identically
  const valueScores: Map<string, { sum: number; count: number }> = new Map();
  const allItems = [...getVignetteItems(), ...getAllBoosterItems()];

  for (const item of allItems) {
    const response = responseMap.get(item.id);
    if (response === undefined) continue;

    // Handle reversed items
    const score = item.reversed ? (6 - response) : response;
    const weightedScore = score * item.weight;

    // Add to primary value
    const current = valueScores.get(item.valueId) || { sum: 0, count: 0 };
    current.sum += weightedScore;
    current.count += item.weight; // Weight counts toward denominator
    valueScores.set(item.valueId, current);

    // Handle tradeoff items: also update the opposing value
    // For tradeoffs, agreeing with the statement boosts the primary value
    // and slightly decreases the opposing value (and vice versa)
    if (item.tradeoff) {
      const { opposingValueId, opposingWeight } = item.tradeoff;
      // For opposing value: invert the score direction
      // If user agrees (5) with primary, that's low (1) for opposing
      // opposingWeight is typically negative, so we use 6-score
      const opposingScore = (6 - score) * Math.abs(opposingWeight);

      const opposingCurrent = valueScores.get(opposingValueId) || { sum: 0, count: 0 };
      opposingCurrent.sum += opposingScore;
      opposingCurrent.count += Math.abs(opposingWeight);
      valueScores.set(opposingValueId, opposingCurrent);
    }
  }

  // Calculate individual mean (across all answered items) for ipsatization
  let totalSum = 0;
  let totalCount = 0;
  for (const { sum, count } of valueScores.values()) {
    totalSum += sum;
    totalCount += count;
  }
  const individualMean = totalCount > 0 ? totalSum / totalCount : 3; // Default to neutral

  // Build value scores array
  const values: ValueScore[] = schwartzSpec.values.map((value) => {
    const scores = valueScores.get(value.id);
    const rawMean = scores && scores.count > 0 ? scores.sum / scores.count : 3;
    const ipsatized = rawMean - individualMean;

    return {
      value_id: value.id,
      name: value.name,
      raw_mean: Math.round(rawMean * 100) / 100,
      ipsatized: Math.round(ipsatized * 100) / 100,
      n_answered: scores?.count || 0,
      dimension_id: value.dimension,
    };
  });

  // Aggregate to dimension level
  const dimensions: DimensionScore[] = schwartzSpec.dimensions.map((dim) => {
    const dimValues = values.filter((v) => v.dimension_id === dim.id);
    const validValues = dimValues.filter((v) => v.n_answered > 0);

    let rawMean = 3;
    let ipsatized = 0;

    if (validValues.length > 0) {
      rawMean = validValues.reduce((s, v) => s + v.raw_mean, 0) / validValues.length;
      ipsatized = validValues.reduce((s, v) => s + v.ipsatized, 0) / validValues.length;
    }

    return {
      dimension_id: dim.id,
      name: dim.name,
      raw_mean: Math.round(rawMean * 100) / 100,
      ipsatized: Math.round(ipsatized * 100) / 100,
      values: dim.values,
    };
  });

  return {
    values,
    dimensions,
    individual_mean: Math.round(individualMean * 100) / 100,
  };
}

/**
 * Score a full assessment: expand vignette picks + merge with booster responses, then score.
 */
export function scoreAssessment(
  vignetteResponses: VignetteResponse[],
  boosterResponses?: ItemResponse[],
): ScoringResult {
  const syntheticResponses = expandVignetteResponses(vignetteResponses);
  const allResponses = boosterResponses
    ? [...syntheticResponses, ...boosterResponses]
    : syntheticResponses;
  return scoreResponses(allResponses);
}

/**
 * Get the spec
 */
export function getSpec(): SchwartzSpec {
  return schwartzSpec;
}

/**
 * Get vignettes for assessment (optionally randomized)
 */
export function getVignettes(randomize: boolean = true): Vignette[] {
  const vignettes = [...schwartzSpec.vignettes];
  if (randomize) {
    // Fisher-Yates shuffle
    for (let i = vignettes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vignettes[i], vignettes[j]] = [vignettes[j], vignettes[i]];
    }
    // Also shuffle options within each vignette
    for (const v of vignettes) {
      v.options = [...v.options];
      for (let i = v.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [v.options[i], v.options[j]] = [v.options[j], v.options[i]];
      }
    }
  }
  return vignettes;
}

/**
 * Convert ipsatized scores to 0-100 scale for visualization
 * Ipsatized scores typically range from -2 to +2
 */
export function ipsatizedToPercent(ipsatized: number): number {
  // Map -2..+2 to 0..100
  const clamped = Math.max(-2, Math.min(2, ipsatized));
  return Math.round(((clamped + 2) / 4) * 100);
}

/**
 * Convert raw mean (1-5) to 0-100 scale for visualization
 */
export function rawMeanToPercent(rawMean: number): number {
  // Map 1..5 to 0..100
  const clamped = Math.max(1, Math.min(5, rawMean));
  return Math.round(((clamped - 1) / 4) * 100);
}
