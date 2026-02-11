/**
 * Ballot Helpers -- pure functions and type definitions for the Ballot Builder.
 *
 * Migrated from the React Native ballot-builder screen. All logic is
 * framework-agnostic so it can be used in any React context.
 */

import type {
  Ballot as ApiBallot,
  BallotContest,
  BallotMeasure,
  BallotCandidate,
  SchwartzValueScore,
} from '@/services/api';
import type { DemographicProfile } from '@/stores/demographicStore';
import { demographicImpacts } from '@/data/demographicImpacts';

// =============================================
// Type definitions
// =============================================

export interface ValueAxis {
  id: string;
  name: string;
  description: string;
  value: number; // 0-10
  poleA: string;
  poleB: string;
  weight: number;
}

export interface CandidateProfile {
  stances: Record<string, number>;
  summary?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party?: string;
  incumbent?: boolean;
  profile: CandidateProfile;
}

export interface BallotItem {
  id: string;
  categoryId: string;
  type: 'proposition' | 'candidate_race';
  title: string;
  questionText: string;
  explanation: string;
  candidates?: Candidate[];
  allowWriteIn?: boolean;
  relevantAxes?: string[];
  yesAxisEffects?: Record<string, number>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type VoteChoice = 'yes' | 'no' | string | null;

export interface AxisBreakdown {
  axisId: string;
  axisName: string;
  userValue: number;
  userStanceLabel: string;
  yesAlignsWith: string;
  noAlignsWith: string;
  alignment: 'yes' | 'no' | 'neutral';
}

export interface PropositionRecommendation {
  vote: 'yes' | 'no' | null;
  confidence: number;
  explanation: string;
  factors: string[];
  breakdown: AxisBreakdown[];
}

export interface CandidateAxisComparison {
  axisId: string;
  axisName: string;
  userValue: number;
  userLabel: string;
  candidateValue: number;
  candidateLabel: string;
  difference: number;
  alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
}

export interface CandidateMatch {
  candidateId: string;
  matchPercent: number;
  isBestMatch: boolean;
  keyAgreements: string[];
  keyDisagreements: string[];
  axisComparisons: CandidateAxisComparison[];
}

export interface UserVote {
  itemId: string;
  choice: VoteChoice;
  writeInName?: string;
  timestamp: string;
}

// =============================================
// Category data
// =============================================

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'measures', name: 'Ballot Measures', icon: 'file-text', color: '#3B82F6' },
  { id: 'contests', name: 'Elected Offices', icon: 'users', color: '#8B5CF6' },
];

// =============================================
// Slider helpers
// =============================================

export function valueToPositionIndex(value: number, totalPositions: number): number {
  return Math.round((value / 10) * (totalPositions - 1));
}

export function positionIndexToValue(index: number, totalPositions: number): number {
  return Math.round((index / (totalPositions - 1)) * 10);
}

export function getGradientSegmentColor(index: number, totalSegments: number): string {
  const t = index / (totalSegments - 1);
  if (t < 0.5) {
    const factor = t * 2;
    const r = Math.round(139 + (229 - 139) * factor);
    const g = Math.round(122 + (231 - 122) * factor);
    const b = Math.round(175 + (235 - 175) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const factor = (t - 0.5) * 2;
    const r = Math.round(229 + (91 - 229) * factor);
    const g = Math.round(231 + (158 - 231) * factor);
    const b = Math.round(235 + (148 - 235) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getSliderThumbColor(position: number, totalPositions: number): string {
  const normalizedPosition = position / (totalPositions - 1);
  if (normalizedPosition <= 0.3) return '#8B7AAF';
  if (normalizedPosition >= 0.7) return '#5B9E94';
  return '#6B7280';
}

// =============================================
// Stance label helper
// =============================================

export function getStanceLabel(value: number, poleA: string, poleB: string): string {
  if (value <= 2) return `Strongly toward "${poleA}"`;
  if (value <= 4) return `Lean toward "${poleA}"`;
  if (value >= 8) return `Strongly toward "${poleB}"`;
  if (value >= 6) return `Lean toward "${poleB}"`;
  return `Balanced / Mixed`;
}

// =============================================
// Data transformation functions
// =============================================

export function transformCandidate(apiCandidate: BallotCandidate): Candidate {
  return {
    id: apiCandidate.id,
    name: apiCandidate.name.ballotDisplay || apiCandidate.name.full,
    party: apiCandidate.party,
    incumbent: apiCandidate.incumbencyStatus === 'incumbent',
    profile: {
      stances: apiCandidate.axisStances || {},
      summary: apiCandidate.profileSummary,
    },
  };
}

export function transformContest(contest: BallotContest): BallotItem {
  const allAxisIds = new Set<string>();
  contest.candidates.forEach((candidate) => {
    if (candidate.axisStances) {
      Object.keys(candidate.axisStances).forEach((axisId) => allAxisIds.add(axisId));
    }
  });

  return {
    id: contest.id,
    categoryId: 'contests',
    type: 'candidate_race',
    title: contest.office,
    questionText: `Vote for ${contest.votingFor === 1 ? 'ONE' : contest.votingFor || 'ONE'} candidate for ${contest.office}`,
    explanation: contest.termInfo || `Choose your preferred candidate for ${contest.office}.`,
    relevantAxes: Array.from(allAxisIds),
    candidates: contest.candidates.map(transformCandidate),
    allowWriteIn: true,
  };
}

export function transformMeasure(measure: BallotMeasure): BallotItem {
  return {
    id: measure.id,
    categoryId: 'measures',
    type: 'proposition',
    title: measure.title,
    questionText: measure.description,
    explanation: measure.explanation,
    relevantAxes: measure.relevantAxes || [],
    yesAxisEffects: measure.yesAxisEffects || {},
  };
}

export function transformBallot(ballot: ApiBallot): { categories: Category[]; items: BallotItem[] } {
  const items: BallotItem[] = [];

  ballot.items.forEach((item) => {
    if (item.type === 'candidate') {
      items.push(transformContest(item as BallotContest));
    } else if (item.type === 'measure') {
      items.push(transformMeasure(item as BallotMeasure));
    }
  });

  const hasMeasures = items.some((item) => item.type === 'proposition');
  const hasContests = items.some((item) => item.type === 'candidate_race');

  const categories: Category[] = [];
  if (hasMeasures) {
    categories.push(DEFAULT_CATEGORIES.find((c) => c.id === 'measures')!);
  }
  if (hasContests) {
    categories.push(DEFAULT_CATEGORIES.find((c) => c.id === 'contests')!);
  }

  return { categories, items };
}

// =============================================
// Recommendation logic
// =============================================

export function computePropositionRecommendation(
  item: BallotItem,
  userAxes: ValueAxis[]
): PropositionRecommendation {
  if (item.type !== 'proposition' || !item.relevantAxes || !item.yesAxisEffects) {
    return { vote: null, confidence: 0, explanation: '', factors: [], breakdown: [] };
  }

  let alignmentScore = 0;
  let totalWeight = 0;
  const factors: string[] = [];
  const breakdown: AxisBreakdown[] = [];

  for (const axisId of item.relevantAxes) {
    const userAxis = userAxes.find((a) => a.id === axisId);
    if (!userAxis) continue;

    const yesEffect = item.yesAxisEffects[axisId] || 0;
    const userPreference = (userAxis.value - 5) / 5;

    const yesAlignsWith = yesEffect < 0 ? userAxis.poleA : userAxis.poleB;
    const noAlignsWith = yesEffect < 0 ? userAxis.poleB : userAxis.poleA;

    let axisAlignment: 'yes' | 'no' | 'neutral' = 'neutral';
    if (yesEffect < 0) {
      if (userAxis.value <= 4) axisAlignment = 'yes';
      else if (userAxis.value >= 6) axisAlignment = 'no';
    } else {
      if (userAxis.value >= 6) axisAlignment = 'yes';
      else if (userAxis.value <= 4) axisAlignment = 'no';
    }

    breakdown.push({
      axisId,
      axisName: userAxis.name,
      userValue: userAxis.value,
      userStanceLabel: getStanceLabel(userAxis.value, userAxis.poleA, userAxis.poleB),
      yesAlignsWith,
      noAlignsWith,
      alignment: axisAlignment,
    });

    const alignment = yesEffect * userPreference;
    const importanceWeight = userAxis.weight;
    alignmentScore += alignment * importanceWeight;
    totalWeight += Math.abs(yesEffect) * importanceWeight;

    if (Math.abs(alignment) > 0.15) {
      factors.push(userAxis.name);
    }
  }

  const normalizedScore = totalWeight > 0 ? alignmentScore / totalWeight : 0;
  const confidence = Math.min(Math.abs(normalizedScore) * 1.2, 1);

  let vote: 'yes' | 'no' | null = null;
  if (normalizedScore > 0.15) vote = 'yes';
  else if (normalizedScore < -0.15) vote = 'no';

  let explanation = '';
  if (vote === 'yes') {
    explanation = `Voting YES aligns with your values${factors.length > 0 ? ` on ${factors.slice(0, 2).join(' and ')}` : ''}.`;
  } else if (vote === 'no') {
    explanation = `Voting NO better matches your priorities${factors.length > 0 ? ` on ${factors.slice(0, 2).join(' and ')}` : ''}.`;
  } else {
    explanation = `This is a close call based on your current values.`;
  }

  return { vote, confidence, explanation, factors, breakdown };
}

export function computeCandidateMatches(
  item: BallotItem,
  userAxes: ValueAxis[]
): CandidateMatch[] {
  if (item.type !== 'candidate_race' || !item.candidates) {
    return [];
  }

  const relevantAxes = item.relevantAxes || [];
  const matches: CandidateMatch[] = [];

  for (const candidate of item.candidates) {
    let totalDiff = 0;
    let axisCount = 0;
    const agreements: string[] = [];
    const disagreements: string[] = [];
    const axisComparisons: CandidateAxisComparison[] = [];

    for (const axisId of relevantAxes) {
      const userAxis = userAxes.find((a) => a.id === axisId);
      const candidateStance = candidate.profile.stances[axisId];

      if (userAxis === undefined || candidateStance === undefined) continue;

      const diff = Math.abs(userAxis.value - candidateStance);
      const importanceWeight = userAxis.weight;
      totalDiff += diff * importanceWeight;
      axisCount += importanceWeight;

      let alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
      if (diff <= 1) alignment = 'strong';
      else if (diff <= 3) alignment = 'moderate';
      else if (diff <= 5) alignment = 'weak';
      else alignment = 'opposed';

      const userLabel = getStanceLabel(userAxis.value, userAxis.poleA, userAxis.poleB);
      const candidateLabel = getStanceLabel(candidateStance, userAxis.poleA, userAxis.poleB);

      axisComparisons.push({
        axisId,
        axisName: userAxis.name,
        userValue: userAxis.value,
        userLabel,
        candidateValue: candidateStance,
        candidateLabel,
        difference: diff,
        alignment,
      });

      if (diff <= 2) {
        agreements.push(userAxis.name);
      } else if (diff >= 4) {
        disagreements.push(userAxis.name);
      }
    }

    const avgDiff = axisCount > 0 ? totalDiff / axisCount : 5;
    const matchPercent = Math.round(Math.max(0, (1 - avgDiff / 10) * 100));

    matches.push({
      candidateId: candidate.id,
      matchPercent,
      isBestMatch: false,
      keyAgreements: agreements.slice(0, 2),
      keyDisagreements: disagreements.slice(0, 2),
      axisComparisons,
    });
  }

  matches.sort((a, b) => b.matchPercent - a.matchPercent);
  if (matches.length > 0 && matches[0].matchPercent > 50) {
    matches[0].isBestMatch = true;
  }

  return matches;
}

// =============================================
// Schwartz Value-Based Recommendations
// =============================================

/** Value names for display */
export const VALUE_DISPLAY_NAMES: Record<string, string> = {
  universalism: 'Fairness & Equality',
  benevolence: 'Helping Others',
  tradition: 'Tradition',
  conformity: 'Respect for Rules',
  security: 'Safety & Stability',
  power: 'Influence & Leadership',
  achievement: 'Personal Success',
  hedonism: 'Enjoying Life',
  stimulation: 'New Experiences',
  self_direction: 'Independence',
};

/** Rich value-framing phrases for generating explanations */
export const VALUE_ALIGNMENT_PHRASES: Record<string, { align: string; differ: string }> = {
  universalism: {
    align: 'shares your belief that we do better when we look out for everyone',
    differ: 'takes a different view on ensuring equal opportunity for all',
  },
  benevolence: {
    align: 'shares your focus on helping others in the community',
    differ: 'prioritizes differently when it comes to community support',
  },
  tradition: {
    align: 'shares your respect for established ways and traditions',
    differ: 'is more open to moving away from traditional approaches',
  },
  conformity: {
    align: 'shares your belief in following rules and maintaining order',
    differ: 'favors more flexibility in how rules are applied',
  },
  security: {
    align: 'shares your priority for safety and stability',
    differ: 'weighs safety concerns differently than you do',
  },
  power: {
    align: 'shares your view on strong leadership and decisive action',
    differ: 'takes a different approach to authority and influence',
  },
  achievement: {
    align: 'shares your drive for success and results',
    differ: 'measures success differently than you do',
  },
  hedonism: {
    align: 'shares your appreciation for quality of life',
    differ: 'prioritizes personal fulfillment differently',
  },
  stimulation: {
    align: 'shares your appetite for new approaches and change',
    differ: 'prefers more measured, incremental change',
  },
  self_direction: {
    align: 'shares your value of independence and personal choice',
    differ: 'favors more collective approaches over individual freedom',
  },
};

/** Policy domain labels for candidate stances */
export const VALUE_POLICY_CONTEXT: Record<string, string[]> = {
  universalism: ['social equity', 'environmental protection', 'civil rights'],
  benevolence: ['community programs', 'social services', 'healthcare'],
  tradition: ['cultural policy', 'family values', 'religious liberty'],
  conformity: ['law enforcement', 'regulatory compliance', 'civic duty'],
  security: ['public safety', 'national security', 'economic stability'],
  power: ['governance', 'leadership', 'institutional authority'],
  achievement: ['economic growth', 'competitiveness', 'performance standards'],
  hedonism: ['arts & culture', 'recreation', 'quality of life'],
  stimulation: ['innovation', 'reform', 'new initiatives'],
  self_direction: ['personal freedom', 'entrepreneurship', 'individual rights'],
};

export interface ValueBreakdown {
  valueId: string;
  valueName: string;
  userScore: number;      // 1-5 raw mean
  userPercent: number;    // 0-100
  effectDirection: number; // -1 to 1 (how YES affects this value)
  alignment: 'yes' | 'no' | 'neutral';
}

export interface ValuePropositionRecommendation {
  vote: 'yes' | 'no' | null;
  confidence: number;
  explanation: string;
  topFactors: string[];
  breakdown: ValueBreakdown[];
}

export interface ValueComparisonDetail {
  valueId: string;
  valueName: string;
  policyContext: string;
  userPreference: number;     // -1 to 1 (how much user values this)
  candidateStance: number;    // -1 to 1 (candidate's position)
  alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
  explanation: string;        // Rich value-framed explanation
}

export interface ValueCandidateMatch {
  candidateId: string;
  matchPercent: number;
  isBestMatch: boolean;
  alignedValues: string[];
  conflictingValues: string[];
  // Rich details for comparison view
  details: ValueComparisonDetail[];
}

/**
 * Compute proposition recommendation based on Schwartz values.
 * Uses yesValueEffects from measure data and user's value scores.
 */
export function computeValuePropositionRecommendation(
  measure: BallotMeasure,
  userValues: SchwartzValueScore[]
): ValuePropositionRecommendation {
  const yesEffects = measure.yesValueEffects as Record<string, number> | undefined;

  if (!yesEffects || Object.keys(yesEffects).length === 0) {
    return { vote: null, confidence: 0, explanation: 'No value mapping available.', topFactors: [], breakdown: [] };
  }

  // Build user value map: valueId -> raw_mean (1-5)
  const userValueMap: Record<string, number> = {};
  for (const score of userValues) {
    userValueMap[score.value_id] = score.raw_mean;
  }

  let alignmentScore = 0;
  let totalWeight = 0;
  const breakdown: ValueBreakdown[] = [];
  const factors: { name: string; impact: number }[] = [];

  for (const [valueId, yesEffect] of Object.entries(yesEffects)) {
    const userScore = userValueMap[valueId];
    if (userScore === undefined) continue;

    // Convert user's 1-5 score to -1 to +1 preference
    // High score (4-5) = strong preference for this value
    // Low score (1-2) = weak preference for this value
    const userPreference = (userScore - 3) / 2; // -1 to +1

    // Calculate alignment: if user values X highly and YES supports X, that's positive
    const alignment = yesEffect * userPreference;

    // Weight by how strongly user feels about this value
    const weight = Math.abs(userPreference);
    alignmentScore += alignment * weight;
    totalWeight += Math.abs(yesEffect) * weight;

    // Convert to 0-100 percent for display
    const userPercent = Math.round(((userScore - 1) / 4) * 100);

    // Determine alignment direction
    let voteAlignment: 'yes' | 'no' | 'neutral' = 'neutral';
    if (alignment > 0.1) voteAlignment = 'yes';
    else if (alignment < -0.1) voteAlignment = 'no';

    breakdown.push({
      valueId,
      valueName: VALUE_DISPLAY_NAMES[valueId] || valueId,
      userScore,
      userPercent,
      effectDirection: yesEffect,
      alignment: voteAlignment,
    });

    if (Math.abs(alignment) > 0.15) {
      factors.push({ name: VALUE_DISPLAY_NAMES[valueId] || valueId, impact: alignment });
    }
  }

  // Normalize score
  const normalizedScore = totalWeight > 0 ? alignmentScore / totalWeight : 0;
  const confidence = Math.min(Math.abs(normalizedScore) * 1.5, 1);

  // Determine vote
  let vote: 'yes' | 'no' | null = null;
  if (normalizedScore > 0.12) vote = 'yes';
  else if (normalizedScore < -0.12) vote = 'no';

  // Sort factors by impact and get top ones
  factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const topFactors = factors.slice(0, 3).map((f) => f.name);

  // Generate explanation
  let explanation = '';
  if (vote === 'yes') {
    explanation = `Voting YES aligns with your values${topFactors.length > 0 ? `, especially ${topFactors.slice(0, 2).join(' and ')}` : ''}.`;
  } else if (vote === 'no') {
    explanation = `Voting NO better matches your priorities${topFactors.length > 0 ? `, especially ${topFactors.slice(0, 2).join(' and ')}` : ''}.`;
  } else {
    explanation = `This measure has mixed implications for your values.`;
  }

  return { vote, confidence, explanation, topFactors, breakdown };
}

/**
 * Compute candidate matches based on Schwartz values.
 * Uses valueStances from candidate data and user's value scores.
 * Returns rich value-framed explanations for display.
 */
export function computeValueCandidateMatches(
  candidates: BallotCandidate[],
  userValues: SchwartzValueScore[]
): ValueCandidateMatch[] {
  // Build user value map: valueId -> raw_mean (1-5) normalized to -1 to +1
  const userValueMap: Record<string, number> = {};
  for (const score of userValues) {
    // Normalize 1-5 to -1 to +1
    userValueMap[score.value_id] = (score.raw_mean - 3) / 2;
  }

  const matches: ValueCandidateMatch[] = [];

  for (const candidate of candidates) {
    const valueStances = candidate.valueStances as Record<string, number> | undefined;

    if (!valueStances || Object.keys(valueStances).length === 0) {
      // No value data - give neutral match
      matches.push({
        candidateId: candidate.id,
        matchPercent: 50,
        isBestMatch: false,
        alignedValues: [],
        conflictingValues: [],
        details: [],
      });
      continue;
    }

    let alignmentSum = 0;
    let count = 0;
    const alignedValues: string[] = [];
    const conflictingValues: string[] = [];
    const details: ValueComparisonDetail[] = [];

    for (const [valueId, candidateStance] of Object.entries(valueStances)) {
      const userPreference = userValueMap[valueId];
      if (userPreference === undefined) continue;

      // Both are -1 to +1 scale
      // Alignment = how much candidate's stance matches user's preference direction
      const alignmentProduct = candidateStance * userPreference;

      // Weight by how strongly both feel
      const weight = Math.abs(userPreference) * Math.abs(candidateStance);
      alignmentSum += alignmentProduct * weight;
      count += weight;

      const valueName = VALUE_DISPLAY_NAMES[valueId] || valueId;
      const phrases = VALUE_ALIGNMENT_PHRASES[valueId];
      const contexts = VALUE_POLICY_CONTEXT[valueId] || [];

      // Determine alignment level
      let alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
      if (alignmentProduct > 0.4) alignment = 'strong';
      else if (alignmentProduct > 0.15) alignment = 'moderate';
      else if (alignmentProduct > -0.15) alignment = 'weak';
      else alignment = 'opposed';

      // Generate rich explanation
      let explanation: string;
      if (alignment === 'strong' || alignment === 'moderate') {
        alignedValues.push(valueName);
        explanation = phrases?.align || `shares your values on ${valueName.toLowerCase()}`;
      } else if (alignment === 'opposed') {
        conflictingValues.push(valueName);
        explanation = phrases?.differ || `has different priorities on ${valueName.toLowerCase()}`;
      } else {
        explanation = `has a similar stance on ${valueName.toLowerCase()}`;
      }

      // Pick a relevant policy context
      const policyContext = contexts[0] || valueName.toLowerCase();

      details.push({
        valueId,
        valueName,
        policyContext,
        userPreference,
        candidateStance,
        alignment,
        explanation,
      });
    }

    // Sort details: aligned first (strong, moderate), then opposed
    details.sort((a, b) => {
      const order = { strong: 0, moderate: 1, weak: 2, opposed: 3 };
      return order[a.alignment] - order[b.alignment];
    });

    // Calculate match percent
    // alignment ranges from -1 to +1, convert to 0-100
    const avgAlignment = count > 0 ? alignmentSum / count : 0;
    const matchPercent = Math.round(((avgAlignment + 1) / 2) * 100);

    matches.push({
      candidateId: candidate.id,
      matchPercent: Math.max(0, Math.min(100, matchPercent)),
      isBestMatch: false,
      alignedValues: alignedValues.slice(0, 3),
      conflictingValues: conflictingValues.slice(0, 2),
      details,
    });
  }

  // Sort by match percent and mark best match
  matches.sort((a, b) => b.matchPercent - a.matchPercent);
  if (matches.length > 0 && matches[0].matchPercent > 55) {
    matches[0].isBestMatch = true;
  }

  return matches;
}

// =============================================
// Demographic-Based Personal Impact Insights
// =============================================

export interface PersonalImpact {
  effect: 'benefit' | 'concern' | 'mixed' | 'context';
  headline: string;
  detail?: string;
}

const EFFECT_PRIORITY: Record<PersonalImpact['effect'], number> = {
  benefit: 0,
  concern: 1,
  mixed: 2,
  context: 3,
};

/**
 * Compute personalized demographic insights for a ballot item.
 * Returns up to 4 matched impacts, sorted by directness (benefits/concerns first, context last).
 */
export function computeDemographicInsights(
  itemId: string,
  demographics: DemographicProfile
): PersonalImpact[] {
  const rules = demographicImpacts[itemId];
  if (!rules) return [];

  const matched: PersonalImpact[] = [];
  const seenHeadlines = new Set<string>();

  for (const rule of rules) {
    const userValue = demographics[rule.field];
    if (userValue == null) continue;
    if (!rule.matchValues.includes(userValue as string)) continue;

    if (seenHeadlines.has(rule.headline)) continue;
    seenHeadlines.add(rule.headline);

    matched.push({
      effect: rule.effect,
      headline: rule.headline,
      detail: rule.detail,
    });
  }

  // Sort: direct impacts first (benefit, concern, mixed), context last
  matched.sort((a, b) => EFFECT_PRIORITY[a.effect] - EFFECT_PRIORITY[b.effect]);

  // Cap at 4 insights
  return matched.slice(0, 4);
}
