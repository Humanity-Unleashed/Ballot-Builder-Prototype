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
} from '@/services/api';

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
