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

// Which axes contribute to each meta-dimension (all 17 axes mapped)
export const META_AXIS_MAP: Record<keyof MetaDimensionScores, string[]> = {
  responsibility_orientation: [
    'econ_safetynet',            // broader safety net ↔ conditional/limited
    'econ_investment',           // public investment ↔ lower taxes
    'econ_tax_structure',        // progressive tax = community, flat/consumption = individual
    'health_coverage_model',     // government insurance ↔ private insurance
    'health_public_health',      // prevention & treatment ↔ personal choice
    'housing_affordability_tools' // rent limits & public housing ↔ fewer rules
  ],
  change_tempo: [
    'housing_supply_zoning',      // build more / density ↔ preserve / limit
    'housing_transport_priority', // transit & biking ↔ cars & parking
    'justice_sentencing_goals',   // rehabilitation ↔ punishment
    'climate_ambition',           // act fast ↔ go slow
    'climate_energy_portfolio',   // solar & wind first ↔ mix of all types
    'climate_permitting'          // thorough review ↔ faster approvals
  ],
  governance_style: [
    'econ_school_choice',             // public schools ↔ school choice
    'health_cost_control',            // government price limits ↔ market competition
    'justice_policing_accountability', // oversight & alternatives ↔ more police
    'justice_firearms',               // stronger gun rules ↔ fewer restrictions
    'justice_reproductive',           // reproductive rights ↔ restrict access
    'climate_permitting'              // thorough review ↔ faster approvals
  ]
};

/**
 * Returns which meta-dimension(s) an axis contributes to.
 * Most axes map to 1 dimension; climate_permitting maps to 2.
 */
export function getAxisMetaDimension(axisId: string): (keyof MetaDimensionScores)[] {
  const dims: (keyof MetaDimensionScores)[] = [];
  for (const [dim, axes] of Object.entries(META_AXIS_MAP) as [keyof MetaDimensionScores, string[]][]) {
    if (axes.includes(axisId)) dims.push(dim);
  }
  return dims;
}

// Convert stance value (0..10) to axis_score in [-1,+1]
// 0 => -1 (max poleA / community / change / rules)
// 5 =>  0 (neutral)
// 10 => +1 (max poleB / individual / stability / flexibility)
function stanceToScore(value0to10: number): number {
  const v = Math.max(0, Math.min(10, value0to10));
  return (v - 5) / 5;
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

// The 9 animal archetypes
export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'resolute_whale',
    emoji: '🐋',
    name: 'Resolute Whale',
    traits: ['Values-driven', 'Reform-minded', 'Collective action'],
    centroid: { responsibility_orientation: -0.8, change_tempo: -0.7, governance_style: -0.6 },
    summary: 'You tend to believe strong systems can be improved, supporting decisive reforms that protect and uplift the broader community.'
  },
  {
    id: 'balanced_raccoon',
    emoji: '🦝',
    name: 'Balanced Raccoon',
    traits: ['Resourceful', 'Coalition-builder', 'Pragmatic reformer'],
    centroid: { responsibility_orientation: -0.4, change_tempo: -0.3, governance_style: -0.3 },
    summary: 'You tend to favor practical improvements to shared systems, building coalitions and finding workable compromises that move things forward.'
  },
  {
    id: 'caring_koala',
    emoji: '🐨',
    name: 'Caring Koala',
    traits: ['Community-minded', 'Steady', 'Systems-oriented'],
    centroid: { responsibility_orientation: -0.6, change_tempo: 0.5, governance_style: -0.3 },
    summary: 'You tend to prioritize shared well-being and steady solutions, especially when systems protect people from harm.'
  },
  {
    id: 'thoughtful_owl',
    emoji: '🦉',
    name: 'Thoughtful Owl',
    traits: ['Evidence-driven', 'Fairness-minded', 'Process-aware'],
    centroid: { responsibility_orientation: -0.2, change_tempo: 0.5, governance_style: -0.7 },
    summary: 'You tend to favor careful, consistent rules and evidence-based decisions that feel fair across people and places.'
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
    id: 'pragmatic_fox',
    emoji: '🦊',
    name: 'Pragmatic Fox',
    traits: ['Practical', 'Flexible', 'Context-aware'],
    centroid: { responsibility_orientation: 0.0, change_tempo: -0.2, governance_style: 0.4 },
    summary: 'You tend to mix tools and adjust as you go, focusing on what works in practice more than rigid labels.'
  },
  {
    id: 'independent_stallion',
    emoji: '🐎',
    name: 'Independent Stallion',
    traits: ['Autonomy-first', 'Action-oriented', 'Choice-focused'],
    centroid: { responsibility_orientation: 0.7, change_tempo: -0.3, governance_style: 0.3 },
    summary: 'You tend to value autonomy and momentum, preferring solutions that give people room to choose and adapt.'
  },
  {
    id: 'loyal_retriever',
    emoji: '🐕',
    name: 'Loyal Retriever',
    traits: ['Trust-building', 'Community glue', 'Continuity'],
    centroid: { responsibility_orientation: 0.3, change_tempo: 0.6, governance_style: 0.5 },
    summary: 'You tend to value trust and continuity, preferring solutions that feel socially grounded and workable for your community.'
  },
  {
    id: 'steadfast_bison',
    emoji: '🦬',
    name: 'Steadfast Bison',
    traits: ['Self-reliant', 'Tradition-rooted', 'Strong convictions'],
    centroid: { responsibility_orientation: 0.7, change_tempo: 0.8, governance_style: 0.7 },
    summary: 'You tend to trust individual responsibility and time-tested approaches, preferring stability and personal freedom over government-led change.'
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
