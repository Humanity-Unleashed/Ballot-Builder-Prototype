/**
 * Archetype System for Gamified Blueprint
 *
 * Computes a user's "civic style" archetype based on meta-dimensions
 * derived from their axis stances weighted by domain importance.
 */

import type { BlueprintProfile } from '../types/blueprintProfile';

// Meta-dimension scores in [-1, +1]
export interface MetaDimensionScores {
  responsibility_orientation: number; // -1 = Community-led, +1 = Individual-led
  change_tempo: number;               // -1 = Change-seeking, +1 = Stability-seeking
  governance_style: number;           // -1 = Rules & standards, +1 = Flexibility & choice
}

// Which axes contribute to each meta-dimension
const META_AXIS_MAP: Record<keyof MetaDimensionScores, string[]> = {
  responsibility_orientation: ['econ_safetynet', 'health_coverage_model', 'health_public_health', 'housing_affordability_tools'],
  change_tempo: ['housing_supply_zoning', 'climate_ambition', 'climate_permitting'],
  governance_style: ['health_cost_control', 'justice_policing_accountability', 'climate_permitting']
};

// Convert stance value (0..10) to axis_score in [-1,+1]
// 0 => +1 (max left/poleA), 5 => 0 (neutral), 10 => -1 (max right/poleB)
function stanceToScore(value0to10: number): number {
  const v = Math.max(0, Math.min(10, value0to10));
  return (5 - v) / 5;
}

// Convert importance (0..10) to weight (0..1)
function importanceWeight(importance0to10: number): number {
  return Math.max(0, Math.min(10, importance0to10)) / 10;
}

// Compute 3 meta-dimension scores from the profile
export function deriveMetaDimensions(profile: BlueprintProfile): MetaDimensionScores {
  const byAxisId = new Map<string, { score: number; weight: number }>();

  for (const d of profile.domains) {
    const w = importanceWeight(d.importance.value_0_10 ?? 5);
    for (const a of d.axes) {
      byAxisId.set(a.axis_id, { score: stanceToScore(a.value_0_10 ?? 5), weight: w });
    }
  }

  const result: MetaDimensionScores = {
    responsibility_orientation: 0,
    change_tempo: 0,
    governance_style: 0
  };

  (Object.keys(META_AXIS_MAP) as Array<keyof MetaDimensionScores>).forEach((metaId) => {
    const axisIds = META_AXIS_MAP[metaId];
    let num = 0;
    let den = 0;
    for (const axisId of axisIds) {
      const v = byAxisId.get(axisId);
      if (!v) continue;
      num += v.score * v.weight;
      den += v.weight;
    }
    result[metaId] = den > 0 ? num / den : 0;
  });

  return result;
}

// Archetype definition
export interface ArchetypeDef {
  id: string;
  emoji: string;
  name: string;
  traits: string[];
  centroid: MetaDimensionScores;
  summary: string;
}

// The 8 animal archetypes
export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'caring_koala',
    emoji: '🐨',
    name: 'Caring Koala',
    traits: ['Community-minded', 'Steady', 'Systems-oriented'],
    centroid: { responsibility_orientation: -0.7, change_tempo: 0.5, governance_style: -0.4 },
    summary: 'You tend to prioritize shared well-being and steady solutions, especially when systems protect people from harm.'
  },
  {
    id: 'independent_stallion',
    emoji: '🐎',
    name: 'Independent Stallion',
    traits: ['Autonomy-first', 'Action-oriented', 'Choice-focused'],
    centroid: { responsibility_orientation: 0.7, change_tempo: -0.4, governance_style: 0.4 },
    summary: 'You tend to value autonomy and momentum, preferring solutions that give people room to choose and adapt.'
  },
  {
    id: 'thoughtful_owl',
    emoji: '🦉',
    name: 'Thoughtful Owl',
    traits: ['Evidence-driven', 'Fairness-minded', 'Process-aware'],
    centroid: { responsibility_orientation: -0.3, change_tempo: 0.6, governance_style: -0.7 },
    summary: 'You tend to favor careful, consistent rules and evidence-based decisions that feel fair across people and places.'
  },
  {
    id: 'pragmatic_fox',
    emoji: '🦊',
    name: 'Pragmatic Fox',
    traits: ['Practical', 'Flexible', 'Context-aware'],
    centroid: { responsibility_orientation: 0.0, change_tempo: -0.2, governance_style: 0.4 },
    summary: 'You tend to mix tools and adjust as you go, focusing on what works in practice more than rigid labels.'
  },
  {
    id: 'steady_turtle',
    emoji: '🐢',
    name: 'Steady Turtle',
    traits: ['Cautious', 'Resilient', 'Long-term'],
    centroid: { responsibility_orientation: -0.2, change_tempo: 0.8, governance_style: 0.1 },
    summary: 'You tend to prioritize durable solutions and risk reduction, preferring proven approaches with clear safeguards.'
  },
  {
    id: 'agile_panther',
    emoji: '🐆',
    name: 'Agile Panther',
    traits: ['Fast-moving', 'Decisive', 'Adaptive'],
    centroid: { responsibility_orientation: 0.4, change_tempo: -0.7, governance_style: 0.1 },
    summary: 'You tend to move quickly and adapt, preferring approaches that respond fast when conditions change.'
  },
  {
    id: 'principled_elephant',
    emoji: '🐘',
    name: 'Principled Elephant',
    traits: ['Values-driven', 'Reform-minded', 'Collective action'],
    centroid: { responsibility_orientation: -0.6, change_tempo: -0.6, governance_style: -0.2 },
    summary: 'You tend to believe strong systems can be improved, supporting decisive reforms when core values are at stake.'
  },
  {
    id: 'loyal_retriever',
    emoji: '🐕',
    name: 'Loyal Retriever',
    traits: ['Trust-building', 'Community glue', 'Continuity'],
    centroid: { responsibility_orientation: -0.1, change_tempo: 0.7, governance_style: 0.5 },
    summary: 'You tend to value trust and continuity, preferring solutions that feel socially grounded and workable for your community.'
  }
];

// Euclidean distance between two meta-dimension score sets
function distance(a: MetaDimensionScores, b: MetaDimensionScores): number {
  const dx = a.responsibility_orientation - b.responsibility_orientation;
  const dy = a.change_tempo - b.change_tempo;
  const dz = a.governance_style - b.governance_style;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Compute average confidence from all axes in profile
export function computeConfidence(profile: BlueprintProfile): number {
  const vals: number[] = [];
  for (const d of profile.domains) {
    for (const a of d.axes) {
      if (typeof a.confidence_0_1 === 'number') vals.push(a.confidence_0_1);
    }
  }
  if (!vals.length) return 0.5;
  return vals.reduce((s, x) => s + x, 0) / vals.length;
}

// Archetype computation result
export interface ArchetypeResult {
  primary: ArchetypeDef;
  secondary?: ArchetypeDef;
  margin: number;
  confidence: number;
  meta: MetaDimensionScores;
}

/**
 * Compute the user's archetype from their profile.
 * Returns primary archetype, optional secondary, margin between them, and confidence.
 */
export function computeArchetype(profile: BlueprintProfile): ArchetypeResult {
  const meta = deriveMetaDimensions(profile);
  const confidence = computeConfidence(profile);

  const ranked = ARCHETYPES
    .map(a => ({ a, dist: distance(meta, a.centroid) }))
    .sort((x, y) => x.dist - y.dist);

  const primary = ranked[0].a;
  const second = ranked[1]?.a;
  const margin = ranked.length >= 2 ? (ranked[1].dist - ranked[0].dist) : 1;

  return { primary, secondary: second, margin, confidence, meta };
}

/**
 * Get confidence label for display
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence < 0.35) return 'Confidence: Low';
  if (confidence < 0.7) return 'Confidence: Medium';
  return 'Confidence: High';
}
