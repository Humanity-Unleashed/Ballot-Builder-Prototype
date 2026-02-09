/**
 * Schwartz Values Scoring Service
 *
 * Implements scoring algorithm for Schwartz Value Survey responses:
 * 1. Calculate raw mean score for each value (sum / count)
 * 2. Optionally apply ipsatization (center on individual mean)
 * 3. Aggregate to dimension level
 */

import {
  schwartzSpec,
  type SchwartzSpec,
} from '../data/schwartzValues';

export interface ItemResponse {
  item_id: string;
  response: 1 | 2 | 3 | 4 | 5; // 5-point Likert
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
 * Score a set of item responses and return value/dimension scores
 */
export function scoreResponses(responses: ItemResponse[]): ScoringResult {
  // Build lookup: item_id -> response
  const responseMap = new Map<string, number>();
  for (const r of responses) {
    responseMap.set(r.item_id, r.response);
  }

  // Calculate raw scores per value
  const valueScores: Map<string, { sum: number; count: number }> = new Map();

  for (const item of schwartzSpec.items) {
    const response = responseMap.get(item.id);
    if (response === undefined) continue;

    // Handle reversed items
    const score = item.reversed ? (6 - response) : response;
    const weightedScore = score * item.weight;

    const current = valueScores.get(item.valueId) || { sum: 0, count: 0 };
    current.sum += weightedScore;
    current.count += item.weight; // Weight counts toward denominator
    valueScores.set(item.valueId, current);
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
 * Get the spec
 */
export function getSpec(): SchwartzSpec {
  return schwartzSpec;
}

/**
 * Get items for assessment (optionally randomized)
 */
export function getAssessmentItems(randomize: boolean = true): typeof schwartzSpec.items {
  const items = [...schwartzSpec.items];
  if (randomize) {
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }
  return items;
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
