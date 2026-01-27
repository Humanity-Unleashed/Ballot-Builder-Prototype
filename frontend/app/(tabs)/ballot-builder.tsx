/**
 * Ballot Builder Screen
 *
 * A mobile-first ballot screen where users mark their vote decisions.
 *
 * Recommendation System:
 * - User's Civic Blueprint is built from swipe actions in Smart Assessment
 * - Propositions: Compares proposition effects against user's values
 * - Candidates: Each candidate has a profile (from voting records/statements)
 *   and we compare user's Blueprint to candidate profiles for match scores
 *
 * Supports:
 * - Proposition questions (YES/NO) with value-based recommendations
 * - Candidate races with match percentage recommendations
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useBlueprint } from '@/context/BlueprintContext';
import {
  ballotApi,
  type Ballot as ApiBallot,
  type BallotContest,
  type BallotMeasure,
  type BallotCandidate,
} from '@/services/api';

// ===========================================
// TypeScript Interfaces
// ===========================================

interface ValueAxis {
  id: string;
  name: string;
  description: string;
  value: number; // 0-10 scale
  poleA: string;
  poleB: string;
  weight: number;
}

/** Candidate's stance on various value axes (like a mini Civic Blueprint) */
interface CandidateProfile {
  /** Stance on each axis: axisId -> value (0-10) */
  stances: Record<string, number>;
  /** Brief summary of their positions */
  summary?: string;
}

interface Candidate {
  id: string;
  name: string;
  party?: string;
  incumbent?: boolean;
  /** Candidate's value profile based on voting records/statements */
  profile: CandidateProfile;
}

interface BallotItem {
  id: string;
  categoryId: string;
  type: 'proposition' | 'candidate_race';
  title: string;
  questionText: string;
  explanation: string;
  /** For candidate races */
  candidates?: Candidate[];
  allowWriteIn?: boolean;
  /** Which value axes are relevant */
  relevantAxes?: string[];
  /** What a YES vote means (for propositions) */
  yesAxisEffects?: Record<string, number>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

type VoteChoice = 'yes' | 'no' | string | null;

interface AxisBreakdown {
  axisId: string;
  axisName: string;
  userValue: number;        // 0-10
  userStanceLabel: string;  // e.g., "You lean toward: More public investment"
  yesAlignsWith: string;    // Which pole YES aligns with
  noAlignsWith: string;     // Which pole NO aligns with
  alignment: 'yes' | 'no' | 'neutral'; // What the user's stance suggests
}

interface PropositionRecommendation {
  vote: 'yes' | 'no' | null;
  confidence: number; // 0-1
  explanation: string;
  factors: string[];
  breakdown: AxisBreakdown[]; // Detailed breakdown for each axis
}

interface CandidateAxisComparison {
  axisId: string;
  axisName: string;
  userValue: number;
  userLabel: string;
  candidateValue: number;
  candidateLabel: string;
  difference: number;      // 0-10, lower is better
  alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
}

interface CandidateMatch {
  candidateId: string;
  matchPercent: number; // 0-100
  isBestMatch: boolean;
  keyAgreements: string[];
  keyDisagreements: string[];
  axisComparisons: CandidateAxisComparison[]; // Detailed comparison
}

interface UserVote {
  itemId: string;
  choice: VoteChoice;
  writeInName?: string;
  timestamp: string;
}

// ===========================================
// Data Transformation Functions
// ===========================================

/** Default categories for ballot items */
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'measures', name: 'Ballot Measures', icon: 'document-text-outline', color: '#3B82F6' },
  { id: 'contests', name: 'Elected Offices', icon: 'people-outline', color: '#8B5CF6' },
];

/** Transform API candidate to internal Candidate type */
function transformCandidate(apiCandidate: BallotCandidate): Candidate {
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

/** Transform API contest to internal BallotItem type */
function transformContest(contest: BallotContest): BallotItem {
  // Extract relevant axes from all candidates' stances
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

/** Transform API measure to internal BallotItem type */
function transformMeasure(measure: BallotMeasure): BallotItem {
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

/** Transform entire API ballot to internal types */
function transformBallot(ballot: ApiBallot): { categories: Category[]; items: BallotItem[] } {
  const items: BallotItem[] = [];

  ballot.items.forEach((item) => {
    if (item.type === 'candidate') {
      items.push(transformContest(item as BallotContest));
    } else if (item.type === 'measure') {
      items.push(transformMeasure(item as BallotMeasure));
    }
  });

  // Determine which categories are actually present
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

// ===========================================
// Recommendation Logic
// ===========================================

/**
 * Get a human-readable label for where the user stands on an axis
 */
function getStanceLabel(value: number, poleA: string, poleB: string): string {
  if (value <= 2) return `Strongly toward "${poleA}"`;
  if (value <= 4) return `Lean toward "${poleA}"`;
  if (value >= 8) return `Strongly toward "${poleB}"`;
  if (value >= 6) return `Lean toward "${poleB}"`;
  return `Balanced / Mixed`;
}

/**
 * Compute recommendation for YES/NO propositions
 * Compares proposition effects against user's value stances
 */
function computePropositionRecommendation(
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
    const userAxis = userAxes.find(a => a.id === axisId);
    if (!userAxis) continue;

    const yesEffect = item.yesAxisEffects[axisId] || 0;
    // Convert user value (0-10) to preference (-1 to 1)
    // 0 = strongly prefers poleA, 10 = strongly prefers poleB
    const userPreference = (userAxis.value - 5) / 5;

    // If YES effect is negative, YES aligns with poleA (low values)
    // If YES effect is positive, YES aligns with poleB (high values)
    const yesAlignsWith = yesEffect < 0 ? userAxis.poleA : userAxis.poleB;
    const noAlignsWith = yesEffect < 0 ? userAxis.poleB : userAxis.poleA;

    // Determine what user's stance suggests
    let axisAlignment: 'yes' | 'no' | 'neutral' = 'neutral';
    if (yesEffect < 0) {
      // YES aligns with poleA (low values)
      if (userAxis.value <= 4) axisAlignment = 'yes';
      else if (userAxis.value >= 6) axisAlignment = 'no';
    } else {
      // YES aligns with poleB (high values)
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

    // Calculate alignment for overall score, weighted by user's importance
    const alignment = yesEffect * userPreference;
    const importanceWeight = userAxis.weight; // 0-1, already normalized from importance
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

/**
 * Compute match scores between user and all candidates
 * Returns sorted list with best match first
 */
function computeCandidateMatches(
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
      const userAxis = userAxes.find(a => a.id === axisId);
      const candidateStance = candidate.profile.stances[axisId];

      if (userAxis === undefined || candidateStance === undefined) continue;

      const diff = Math.abs(userAxis.value - candidateStance);
      const importanceWeight = userAxis.weight; // 0-1, already normalized from importance
      totalDiff += diff * importanceWeight;
      axisCount += importanceWeight; // Weight the count by importance

      // Determine alignment level
      let alignment: 'strong' | 'moderate' | 'weak' | 'opposed';
      if (diff <= 1) alignment = 'strong';
      else if (diff <= 3) alignment = 'moderate';
      else if (diff <= 5) alignment = 'weak';
      else alignment = 'opposed';

      // Get labels for user and candidate positions
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

      // Track what they agree/disagree on
      if (diff <= 2) {
        agreements.push(userAxis.name);
      } else if (diff >= 4) {
        disagreements.push(userAxis.name);
      }
    }

    // Calculate match percentage (inverse of average difference)
    // Max diff per axis is 10, so perfect alignment = 100%, max diff = 0%
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

  // Sort by match percentage (highest first) and mark best match
  matches.sort((a, b) => b.matchPercent - a.matchPercent);
  if (matches.length > 0 && matches[0].matchPercent > 50) {
    matches[0].isBestMatch = true;
  }

  return matches;
}

// ===========================================
// Components
// ===========================================

// --- Category & Progress Header ---
function CategoryHeader({
  category,
  currentIndex,
  total,
}: {
  category: Category;
  currentIndex: number;
  total: number;
}) {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <View style={catStyles.container}>
      <View style={catStyles.row}>
        <View style={[catStyles.badge, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as any} size={16} color={category.color} />
          <Text style={[catStyles.badgeText, { color: category.color }]}>{category.name}</Text>
        </View>
        <Text style={catStyles.counter}>{currentIndex + 1} of {total}</Text>
      </View>
      <View style={catStyles.progressBg}>
        <View style={[catStyles.progressFill, { width: `${progress}%`, backgroundColor: category.color }]} />
      </View>
    </View>
  );
}

const catStyles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  counter: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },
  progressBg: { height: 4, backgroundColor: Colors.gray[200], borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});

// --- Ballot Item Header ---
function BallotItemHeader({ item }: { item: BallotItem }) {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>{item.title}</Text>
      <Text style={headerStyles.question}>{item.questionText}</Text>
      <View style={headerStyles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={headerStyles.infoText}>{item.explanation}</Text>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { gap: 12 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  question: { fontSize: 18, fontWeight: '700', color: Colors.gray[900], lineHeight: 26 },
  infoBox: { flexDirection: 'row', backgroundColor: Colors.primary + '10', padding: 12, borderRadius: 12, gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 14, color: Colors.gray[700], lineHeight: 21 },
});

// --- Recommendation Banner (for propositions) ---
function RecommendationBanner({
  recommendation
}: {
  recommendation: PropositionRecommendation
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!recommendation.vote || recommendation.confidence < 0.2) {
    return (
      <View style={[recStyles.banner, recStyles.neutralBanner]}>
        <View style={recStyles.bannerHeader}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.gray[500]} />
          <Text style={recStyles.neutralTitle}>Close Call</Text>
        </View>
        <Text style={recStyles.bannerText}>{recommendation.explanation}</Text>

        {/* How we calculated - expandable */}
        {recommendation.breakdown.length > 0 && (
          <>
            <TouchableOpacity
              style={recStyles.howButton}
              onPress={() => setShowBreakdown(!showBreakdown)}
              activeOpacity={0.7}
            >
              <Ionicons name="calculator-outline" size={16} color={Colors.gray[500]} />
              <Text style={recStyles.howButtonText}>
                {showBreakdown ? 'Hide details' : 'How we calculated this'}
              </Text>
              <Ionicons name={showBreakdown ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray[400]} />
            </TouchableOpacity>

            {showBreakdown && (
              <View style={recStyles.breakdownContainer}>
                <Text style={recStyles.breakdownIntro}>
                  We compare your values to what YES and NO mean for this measure:
                </Text>
                {recommendation.breakdown.map(axis => (
                  <View key={axis.axisId} style={recStyles.breakdownItem}>
                    <Text style={recStyles.breakdownAxisName}>{axis.axisName}</Text>
                    <View style={recStyles.breakdownRow}>
                      <Ionicons name="person" size={14} color={Colors.primary} />
                      <Text style={recStyles.breakdownLabel}>Your stance: </Text>
                      <Text style={recStyles.breakdownValue}>{axis.userStanceLabel}</Text>
                    </View>
                    <View style={recStyles.breakdownRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                      <Text style={recStyles.breakdownLabel}>YES means: </Text>
                      <Text style={recStyles.breakdownValue}>{axis.yesAlignsWith}</Text>
                    </View>
                    <View style={recStyles.breakdownRow}>
                      <Ionicons name="close-circle" size={14} color="#EF4444" />
                      <Text style={recStyles.breakdownLabel}>NO means: </Text>
                      <Text style={recStyles.breakdownValue}>{axis.noAlignsWith}</Text>
                    </View>
                    <View style={[
                      recStyles.alignmentBadge,
                      axis.alignment === 'yes' && recStyles.alignmentYes,
                      axis.alignment === 'no' && recStyles.alignmentNo,
                      axis.alignment === 'neutral' && recStyles.alignmentNeutral,
                    ]}>
                      <Text style={recStyles.alignmentText}>
                        {axis.alignment === 'yes' ? '→ Your values suggest YES' :
                         axis.alignment === 'no' ? '→ Your values suggest NO' :
                         '→ Neutral on this issue'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    );
  }

  const isYes = recommendation.vote === 'yes';
  const confidenceLabel = recommendation.confidence > 0.7 ? 'Strong' : recommendation.confidence > 0.4 ? 'Moderate' : 'Slight';

  return (
    <View style={[recStyles.banner, isYes ? recStyles.yesBanner : recStyles.noBanner]}>
      <View style={recStyles.bannerHeader}>
        <Ionicons name="sparkles" size={20} color={isYes ? '#16A34A' : '#DC2626'} />
        <Text style={[recStyles.bannerTitle, { color: isYes ? '#16A34A' : '#DC2626' }]}>
          {confidenceLabel} recommendation: Vote {isYes ? 'YES' : 'NO'}
        </Text>
      </View>
      <Text style={recStyles.bannerText}>{recommendation.explanation}</Text>
      <View style={recStyles.confidenceBar}>
        <View style={[
          recStyles.confidenceFill,
          { width: `${recommendation.confidence * 100}%`, backgroundColor: isYes ? '#22C55E' : '#EF4444' }
        ]} />
      </View>

      {/* How we calculated - expandable */}
      {recommendation.breakdown.length > 0 && (
        <>
          <TouchableOpacity
            style={recStyles.howButton}
            onPress={() => setShowBreakdown(!showBreakdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="calculator-outline" size={16} color={isYes ? '#16A34A' : '#DC2626'} />
            <Text style={[recStyles.howButtonText, { color: isYes ? '#16A34A' : '#DC2626' }]}>
              {showBreakdown ? 'Hide details' : 'How we calculated this'}
            </Text>
            <Ionicons name={showBreakdown ? 'chevron-up' : 'chevron-down'} size={16} color={isYes ? '#16A34A' : '#DC2626'} />
          </TouchableOpacity>

          {showBreakdown && (
            <View style={recStyles.breakdownContainer}>
              <Text style={recStyles.breakdownIntro}>
                We compare your values to what YES and NO mean for this measure:
              </Text>
              {recommendation.breakdown.map(axis => (
                <View key={axis.axisId} style={recStyles.breakdownItem}>
                  <Text style={recStyles.breakdownAxisName}>{axis.axisName}</Text>
                  <View style={recStyles.breakdownRow}>
                    <Ionicons name="person" size={14} color={Colors.primary} />
                    <Text style={recStyles.breakdownLabel}>Your stance: </Text>
                    <Text style={recStyles.breakdownValue}>{axis.userStanceLabel}</Text>
                  </View>
                  <View style={recStyles.breakdownRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                    <Text style={recStyles.breakdownLabel}>YES means: </Text>
                    <Text style={recStyles.breakdownValue}>{axis.yesAlignsWith}</Text>
                  </View>
                  <View style={recStyles.breakdownRow}>
                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                    <Text style={recStyles.breakdownLabel}>NO means: </Text>
                    <Text style={recStyles.breakdownValue}>{axis.noAlignsWith}</Text>
                  </View>
                  <View style={[
                    recStyles.alignmentBadge,
                    axis.alignment === 'yes' && recStyles.alignmentYes,
                    axis.alignment === 'no' && recStyles.alignmentNo,
                    axis.alignment === 'neutral' && recStyles.alignmentNeutral,
                  ]}>
                    <Text style={recStyles.alignmentText}>
                      {axis.alignment === 'yes' ? '→ Your values suggest YES' :
                       axis.alignment === 'no' ? '→ Your values suggest NO' :
                       '→ Neutral on this issue'}
                    </Text>
                  </View>
                </View>
              ))}
              <Text style={recStyles.breakdownSummary}>
                Overall: {recommendation.breakdown.filter(a => a.alignment === 'yes').length} value(s) suggest YES, {' '}
                {recommendation.breakdown.filter(a => a.alignment === 'no').length} suggest NO
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const recStyles = StyleSheet.create({
  banner: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    gap: 10,
  },
  yesBanner: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  noBanner: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  neutralBanner: { backgroundColor: Colors.gray[100], borderColor: Colors.gray[200] },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerTitle: { fontSize: 15, fontWeight: '700', flex: 1, lineHeight: 20 },
  neutralTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[600], flex: 1, lineHeight: 20 },
  bannerText: { fontSize: 14, color: Colors.gray[700], lineHeight: 21 },
  confidenceBar: { height: 4, backgroundColor: Colors.gray[200], borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 2 },
  // Expandable breakdown styles
  howButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  howButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  breakdownContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    gap: 12,
  },
  breakdownIntro: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 19,
    marginBottom: 4,
  },
  breakdownItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.gray[200],
    paddingLeft: 12,
    paddingVertical: 8,
    gap: 6,
  },
  breakdownAxisName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  breakdownLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[700],
    flex: 1,
  },
  alignmentBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  alignmentYes: {
    backgroundColor: '#DCFCE7',
  },
  alignmentNo: {
    backgroundColor: '#FEE2E2',
  },
  alignmentNeutral: {
    backgroundColor: Colors.gray[100],
  },
  alignmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  breakdownSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});

// --- Proposition Vote Buttons (YES/NO) ---
function PropositionVoteButtons({
  selected,
  onSelect,
  recommendation,
}: {
  selected: VoteChoice;
  onSelect: (choice: 'yes' | 'no') => void;
  recommendation: PropositionRecommendation;
}) {
  const isYesRecommended = recommendation.vote === 'yes';
  const isNoRecommended = recommendation.vote === 'no';

  return (
    <View style={voteStyles.container}>
      <Text style={voteStyles.label}>YOUR VOTE</Text>

      <View style={voteStyles.buttonRow}>
        {/* YES Button */}
        <TouchableOpacity
          style={[
            voteStyles.voteButton,
            voteStyles.yesButton,
            selected === 'yes' && voteStyles.yesButtonSelected,
          ]}
          onPress={() => onSelect('yes')}
          activeOpacity={0.8}
        >
          {isYesRecommended && selected !== 'yes' && (
            <View style={voteStyles.recBadge}>
              <Ionicons name="sparkles" size={12} color="#16A34A" />
            </View>
          )}
          <Ionicons
            name={selected === 'yes' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={32}
            color={selected === 'yes' ? '#fff' : '#22C55E'}
          />
          <Text style={[voteStyles.voteText, selected === 'yes' && voteStyles.voteTextSelected]}>
            YES
          </Text>
        </TouchableOpacity>

        {/* NO Button */}
        <TouchableOpacity
          style={[
            voteStyles.voteButton,
            voteStyles.noButton,
            selected === 'no' && voteStyles.noButtonSelected,
          ]}
          onPress={() => onSelect('no')}
          activeOpacity={0.8}
        >
          {isNoRecommended && selected !== 'no' && (
            <View style={[voteStyles.recBadge, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="sparkles" size={12} color="#DC2626" />
            </View>
          )}
          <Ionicons
            name={selected === 'no' ? 'close-circle' : 'close-circle-outline'}
            size={32}
            color={selected === 'no' ? '#fff' : '#EF4444'}
          />
          <Text style={[voteStyles.voteText, selected === 'no' && voteStyles.voteTextSelected]}>
            NO
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const voteStyles = StyleSheet.create({
  container: { gap: 12 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.5 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  voteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
    position: 'relative',
  },
  yesButton: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  yesButtonSelected: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  noButton: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  noButtonSelected: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  voteText: { fontSize: 20, fontWeight: '800', color: Colors.gray[700] },
  voteTextSelected: { color: '#fff' },
  recBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// --- Candidate Card with Expandable Breakdown ---
function CandidateCard({
  candidate,
  isSelected,
  match,
  onSelect,
}: {
  candidate: Candidate;
  isSelected: boolean;
  match: CandidateMatch | undefined;
  onSelect: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const matchPercent = match?.matchPercent || 0;
  const isBestMatch = match?.isBestMatch || false;

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'strong': return '#22C55E';
      case 'moderate': return '#84CC16';
      case 'weak': return '#F59E0B';
      case 'opposed': return '#EF4444';
      default: return Colors.gray[400];
    }
  };

  const getAlignmentLabel = (alignment: string) => {
    switch (alignment) {
      case 'strong': return 'Strong match';
      case 'moderate': return 'Good match';
      case 'weak': return 'Weak match';
      case 'opposed': return 'Differs';
      default: return 'Unknown';
    }
  };

  return (
    <View style={[
      candStyles.candidateCard,
      isSelected && candStyles.candidateSelected,
      isBestMatch && !isSelected && candStyles.candidateBestMatch,
    ]}>
      <TouchableOpacity
        style={candStyles.candidateMainRow}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        {/* Radio button */}
        <View style={[candStyles.radio, isSelected && candStyles.radioSelected]}>
          {isSelected && <View style={candStyles.radioDot} />}
        </View>

        {/* Candidate info */}
        <View style={candStyles.candidateInfo}>
          <View style={candStyles.nameRow}>
            <Text style={[candStyles.name, isSelected && candStyles.nameSelected]}>
              {candidate.name}
            </Text>
            {candidate.incumbent && (
              <View style={candStyles.incumbentBadge}>
                <Text style={candStyles.incumbentText}>Incumbent</Text>
              </View>
            )}
          </View>

          {candidate.party && (
            <Text style={candStyles.party}>{candidate.party}</Text>
          )}

          {candidate.profile.summary && (
            <Text style={candStyles.summary} numberOfLines={2}>
              {candidate.profile.summary}
            </Text>
          )}

          {/* Match info */}
          {match && match.keyAgreements.length > 0 && (
            <Text style={candStyles.matchDetail}>
              Agrees on: {match.keyAgreements.join(', ')}
            </Text>
          )}
        </View>

        {/* Match percentage */}
        <View style={candStyles.matchContainer}>
          {isBestMatch && (
            <View style={candStyles.bestMatchBadge}>
              <Ionicons name="sparkles" size={10} color="#fff" />
            </View>
          )}
          <View style={[
            candStyles.matchCircle,
            matchPercent >= 70 && candStyles.matchHigh,
            matchPercent >= 40 && matchPercent < 70 && candStyles.matchMedium,
            matchPercent < 40 && candStyles.matchLow,
          ]}>
            <Text style={candStyles.matchPercent}>{matchPercent}%</Text>
            <Text style={candStyles.matchLabel}>match</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expandable breakdown */}
      {match && match.axisComparisons.length > 0 && (
        <View style={candStyles.breakdownSection}>
          <TouchableOpacity
            style={candStyles.breakdownToggle}
            onPress={() => setShowBreakdown(!showBreakdown)}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={14} color={Colors.gray[500]} />
            <Text style={candStyles.breakdownToggleText}>
              {showBreakdown ? 'Hide comparison' : 'See how we compare'}
            </Text>
            <Ionicons name={showBreakdown ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.gray[400]} />
          </TouchableOpacity>

          {showBreakdown && (
            <View style={candStyles.breakdownContent}>
              <Text style={candStyles.breakdownIntro}>
                Comparing your values to {candidate.name.split(' ')[0]}'s positions:
              </Text>

              {match.axisComparisons.map(comparison => (
                <View key={comparison.axisId} style={candStyles.comparisonItem}>
                  <View style={candStyles.comparisonHeader}>
                    <Text style={candStyles.comparisonAxisName}>{comparison.axisName}</Text>
                    <View style={[
                      candStyles.alignmentPill,
                      { backgroundColor: getAlignmentColor(comparison.alignment) + '20' }
                    ]}>
                      <Text style={[
                        candStyles.alignmentPillText,
                        { color: getAlignmentColor(comparison.alignment) }
                      ]}>
                        {getAlignmentLabel(comparison.alignment)}
                      </Text>
                    </View>
                  </View>

                  <View style={candStyles.comparisonBars}>
                    {/* Your position */}
                    <View style={candStyles.barRow}>
                      <Text style={candStyles.barLabel}>You</Text>
                      <View style={candStyles.barTrack}>
                        <View
                          style={[
                            candStyles.barFill,
                            candStyles.barFillUser,
                            { width: `${(comparison.userValue / 10) * 100}%` }
                          ]}
                        />
                        <View
                          style={[
                            candStyles.barMarker,
                            { left: `${(comparison.userValue / 10) * 100}%` }
                          ]}
                        />
                      </View>
                      <Text style={candStyles.barValue}>{comparison.userValue}</Text>
                    </View>

                    {/* Candidate position */}
                    <View style={candStyles.barRow}>
                      <Text style={candStyles.barLabel}>{candidate.name.split(' ')[0]}</Text>
                      <View style={candStyles.barTrack}>
                        <View
                          style={[
                            candStyles.barFill,
                            candStyles.barFillCandidate,
                            { width: `${(comparison.candidateValue / 10) * 100}%` }
                          ]}
                        />
                        <View
                          style={[
                            candStyles.barMarker,
                            candStyles.barMarkerCandidate,
                            { left: `${(comparison.candidateValue / 10) * 100}%` }
                          ]}
                        />
                      </View>
                      <Text style={candStyles.barValue}>{comparison.candidateValue}</Text>
                    </View>
                  </View>

                  {comparison.alignment === 'opposed' && (
                    <Text style={candStyles.comparisonNote}>
                      Difference of {comparison.difference} points - you may disagree on this issue
                    </Text>
                  )}
                </View>
              ))}

              <View style={candStyles.matchSummary}>
                <Text style={candStyles.matchSummaryText}>
                  Overall: {match.axisComparisons.filter(c => c.alignment === 'strong' || c.alignment === 'moderate').length} of {match.axisComparisons.length} values align well
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// --- Candidate Selection with Match Scores ---
function CandidateVoteButtons({
  candidates,
  allowWriteIn,
  selected,
  writeInName,
  matches,
  onSelect,
  onWriteInChange,
}: {
  candidates: Candidate[];
  allowWriteIn: boolean;
  selected: VoteChoice;
  writeInName: string;
  matches: CandidateMatch[];
  onSelect: (choice: string) => void;
  onWriteInChange: (name: string) => void;
}) {
  const isWriteIn = selected === 'write_in';

  const getMatch = (candidateId: string) => matches.find(m => m.candidateId === candidateId);

  // Sort candidates by match percentage
  const sortedCandidates = [...candidates].sort((a, b) => {
    const matchA = getMatch(a.id)?.matchPercent || 0;
    const matchB = getMatch(b.id)?.matchPercent || 0;
    return matchB - matchA;
  });

  return (
    <View style={candStyles.container}>
      <Text style={candStyles.label}>SELECT ONE CANDIDATE</Text>

      <View style={candStyles.list}>
        {sortedCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selected === candidate.id}
            match={getMatch(candidate.id)}
            onSelect={() => onSelect(candidate.id)}
          />
        ))}

        {/* Write-in option */}
        {allowWriteIn && (
          <TouchableOpacity
            style={[candStyles.candidateCard, isWriteIn && candStyles.candidateSelected]}
            onPress={() => onSelect('write_in')}
            activeOpacity={0.8}
          >
            <View style={[candStyles.radio, isWriteIn && candStyles.radioSelected]}>
              {isWriteIn && <View style={candStyles.radioDot} />}
            </View>
            <View style={candStyles.candidateInfo}>
              <Text style={[candStyles.name, isWriteIn && candStyles.nameSelected]}>Write-in candidate</Text>
              {isWriteIn && (
                <TextInput
                  style={candStyles.writeInInput}
                  placeholder="Enter candidate name..."
                  placeholderTextColor={Colors.gray[400]}
                  value={writeInName}
                  onChangeText={onWriteInChange}
                  autoFocus
                />
              )}
            </View>
            <View style={candStyles.matchContainer}>
              <View style={[candStyles.matchCircle, candStyles.matchUnknown]}>
                <Text style={candStyles.matchPercent}>?</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const candStyles = StyleSheet.create({
  container: { gap: 12 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.5 },
  list: { gap: 12 },
  candidateCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  candidateMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  candidateSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  candidateBestMatch: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  candidateInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.gray[900], lineHeight: 22 },
  nameSelected: { color: Colors.primary },
  party: { fontSize: 13, color: Colors.gray[500], lineHeight: 18 },
  summary: { fontSize: 12, color: Colors.gray[600], lineHeight: 17, marginTop: 4 },
  matchDetail: { fontSize: 11, color: '#16A34A', marginTop: 4, lineHeight: 15 },
  incumbentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
  },
  incumbentText: { fontSize: 11, fontWeight: '600', color: Colors.gray[600] },
  matchContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bestMatchBadge: {
    backgroundColor: '#22C55E',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  matchCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  matchHigh: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  matchMedium: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  matchLow: { borderColor: Colors.gray[300], backgroundColor: Colors.gray[50] },
  matchUnknown: { borderColor: Colors.gray[200], backgroundColor: Colors.gray[50] },
  matchPercent: { fontSize: 14, fontWeight: '800', color: Colors.gray[900] },
  matchLabel: { fontSize: 9, color: Colors.gray[500], textTransform: 'uppercase' },
  writeInInput: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    fontSize: 15,
    color: Colors.gray[900],
  },
  // Breakdown section styles
  breakdownSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[500],
    flex: 1,
  },
  breakdownContent: {
    marginTop: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  breakdownIntro: {
    fontSize: 12,
    color: Colors.gray[600],
    lineHeight: 16,
  },
  comparisonItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  comparisonAxisName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[800],
    flex: 1,
  },
  alignmentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alignmentPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  comparisonBars: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    width: 50,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barFillUser: {
    backgroundColor: Colors.primary + '60',
  },
  barFillCandidate: {
    backgroundColor: '#22C55E60',
  },
  barMarker: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    top: -2,
    marginLeft: -2,
  },
  barMarkerCandidate: {
    backgroundColor: '#22C55E',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gray[600],
    width: 20,
    textAlign: 'right',
  },
  comparisonNote: {
    fontSize: 10,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 2,
  },
  matchSummary: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  matchSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

// --- Expandable Values Section ---
function ValuesSection({
  axes,
  relevantAxisIds,
  onValueChange,
  expanded,
  onToggle,
}: {
  axes: ValueAxis[];
  relevantAxisIds: string[];
  onValueChange: (axisId: string, value: number) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const relevantAxes = axes.filter(a => relevantAxisIds.includes(a.id));
  if (relevantAxes.length === 0) return null;

  return (
    <View style={valStyles.container}>
      <TouchableOpacity style={valStyles.header} onPress={onToggle} activeOpacity={0.7}>
        <View style={valStyles.headerLeft}>
          <Ionicons name="options-outline" size={20} color={Colors.gray[600]} />
          <Text style={valStyles.headerText}>Adjust your values</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.gray[400]} />
      </TouchableOpacity>

      {expanded && (
        <View style={valStyles.body}>
          <Text style={valStyles.hint}>
            Changing these will update recommendations across your ballot.
          </Text>
          {relevantAxes.map(axis => (
            <ValueSlider
              key={axis.id}
              axis={axis}
              onChange={(value) => onValueChange(axis.id, value)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ValueSlider({ axis, onChange }: { axis: ValueAxis; onChange: (value: number) => void }) {
  const [barWidth, setBarWidth] = useState(0);

  // Calculate marker position (0-100%)
  const markerPosition = (axis.value / 10) * 100;

  // Determine accent color based on position
  const getAccentColor = () => {
    if (axis.value <= 3) return '#A855F7'; // Purple - toward poleA
    if (axis.value >= 7) return '#14B8A6'; // Teal - toward poleB
    return '#6B7280'; // Gray - center/mixed
  };

  // Handle tap on the gradient bar to change value
  const handleBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const width = barWidth || 280;
    const percentage = Math.max(0, Math.min(1, locationX / width));
    const newValue = Math.round(percentage * 10);
    onChange(newValue);
  };

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.name}>{axis.name}</Text>

      {/* Gradient bar with marker */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleBarPress}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={sliderStyles.barWrapper}
      >
        <View style={sliderStyles.gradientBar}>
          {/* Smooth gradient with multiple segments */}
          {Array.from({ length: 20 }, (_, i) => {
            const t = i / 19; // 0 to 1
            // Interpolate: purple (0) -> gray (0.5) -> teal (1)
            let color: string;
            if (t < 0.5) {
              // Purple to gray
              const factor = t * 2;
              const r = Math.round(168 + (229 - 168) * factor);
              const g = Math.round(85 + (231 - 85) * factor);
              const b = Math.round(247 + (235 - 247) * factor);
              color = `rgb(${r}, ${g}, ${b})`;
            } else {
              // Gray to teal
              const factor = (t - 0.5) * 2;
              const r = Math.round(229 + (20 - 229) * factor);
              const g = Math.round(231 + (184 - 231) * factor);
              const b = Math.round(235 + (166 - 235) * factor);
              color = `rgb(${r}, ${g}, ${b})`;
            }
            return (
              <View
                key={i}
                style={[
                  sliderStyles.gradientSegment,
                  { backgroundColor: color },
                  i === 0 && sliderStyles.gradientSegmentFirst,
                  i === 19 && sliderStyles.gradientSegmentLast,
                ]}
              />
            );
          })}
        </View>

        {/* Marker */}
        <View style={[sliderStyles.marker, { left: `${markerPosition}%` }]}>
          <View style={[sliderStyles.markerInner, { borderColor: getAccentColor() }]} />
        </View>
      </TouchableOpacity>

      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.poleLabelLeft}>{axis.poleA}</Text>
        <Text style={sliderStyles.poleLabelRight}>{axis.poleB}</Text>
      </View>
    </View>
  );
}

const valStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { fontSize: 15, fontWeight: '600', color: Colors.gray[700] },
  body: { padding: 14, paddingTop: 0, gap: 14 },
  hint: { fontSize: 13, color: Colors.gray[500], lineHeight: 18 },
});

const sliderStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 8,
  },
  name: { fontSize: 14, fontWeight: '600', color: Colors.gray[900] },
  barWrapper: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
  },
  gradientBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  gradientSegment: {
    flex: 1,
    height: '100%',
  },
  gradientSegmentFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  gradientSegmentLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  marker: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  poleLabelLeft: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A855F7',
    textTransform: 'uppercase',
    flexShrink: 1,
    maxWidth: '45%',
  },
  poleLabelRight: {
    fontSize: 11,
    fontWeight: '600',
    color: '#14B8A6',
    textTransform: 'uppercase',
    flexShrink: 1,
    maxWidth: '45%',
    textAlign: 'right',
  },
});

// --- Navigation Buttons ---
function NavigationButtons({
  canGoBack,
  hasSelection,
  onBack,
  onNext,
  onSkip,
  isLast,
}: {
  canGoBack: boolean;
  hasSelection: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}) {
  return (
    <View style={navStyles.container}>
      <TouchableOpacity
        style={[navStyles.primaryButton, !hasSelection && navStyles.primaryDisabled]}
        onPress={onNext}
        activeOpacity={0.8}
        disabled={!hasSelection}
      >
        <Text style={navStyles.primaryText}>{isLast ? 'Finish Ballot' : 'Save & Continue'}</Text>
        <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={20} color={Colors.white} />
      </TouchableOpacity>

      <View style={navStyles.secondaryRow}>
        <TouchableOpacity
          style={[navStyles.secondaryButton, !canGoBack && navStyles.secondaryDisabled]}
          onPress={onBack}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={18} color={canGoBack ? Colors.gray[600] : Colors.gray[300]} />
          <Text style={[navStyles.secondaryText, !canGoBack && navStyles.secondaryTextDisabled]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={navStyles.secondaryButton} onPress={onSkip}>
          <Text style={navStyles.secondaryText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Ballot Summary Screen ---
function BallotSummary({
  votes,
  ballotItems,
  categories,
  onEditItem,
  onStartOver,
  onPrint,
}: {
  votes: UserVote[];
  ballotItems: BallotItem[];
  categories: Category[];
  onEditItem: (index: number) => void;
  onStartOver: () => void;
  onPrint: () => void;
}) {
  const votedCount = votes.length;
  const skippedCount = ballotItems.length - votedCount;

  const getVoteDisplay = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'YES' : 'NO';
    } else {
      if (vote.choice === 'write_in') {
        return `Write-in: ${vote.writeInName}`;
      }
      const candidate = item.candidates?.find(c => c.id === vote.choice);
      return candidate?.name || vote.choice;
    }
  };

  const getVoteIcon = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'checkmark-circle' : 'close-circle';
    }
    return 'person';
  };

  const getVoteColor = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? '#22C55E' : '#EF4444';
    }
    return Colors.primary;
  };

  // Group by category
  const groupedItems = categories.map(cat => ({
    category: cat,
    items: ballotItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.categoryId === cat.id),
  })).filter(g => g.items.length > 0);

  return (
    <View style={summaryStyles.container}>
      <View style={summaryStyles.header}>
        <Ionicons name="checkmark-done-circle" size={48} color="#22C55E" />
        <Text style={summaryStyles.headerTitle}>Your Ballot is Ready!</Text>
        <Text style={summaryStyles.headerSubtitle}>
          {votedCount} items voted • {skippedCount > 0 ? `${skippedCount} skipped` : 'All items completed'}
        </Text>
      </View>

      <ScrollView style={summaryStyles.scrollView} showsVerticalScrollIndicator={false}>
        {groupedItems.map(({ category, items }) => (
          <View key={category.id} style={summaryStyles.categorySection}>
            <View style={[summaryStyles.categoryBadge, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon as any} size={16} color={category.color} />
              <Text style={[summaryStyles.categoryName, { color: category.color }]}>{category.name}</Text>
            </View>

            {items.map(({ item, index }) => {
              const vote = votes.find(v => v.itemId === item.id);
              const isSkipped = !vote;

              return (
                <View key={item.id} style={summaryStyles.itemCard}>
                  <View style={summaryStyles.itemContent}>
                    <Text style={summaryStyles.itemTitle}>{item.title}</Text>
                    {isSkipped ? (
                      <View style={summaryStyles.skippedBadge}>
                        <Ionicons name="remove-circle-outline" size={16} color={Colors.gray[400]} />
                        <Text style={summaryStyles.skippedText}>Skipped</Text>
                      </View>
                    ) : (
                      <View style={summaryStyles.voteBadge}>
                        <Ionicons
                          name={getVoteIcon(vote, item) as any}
                          size={18}
                          color={getVoteColor(vote, item)}
                        />
                        <Text style={[summaryStyles.voteText, { color: getVoteColor(vote, item) }]}>
                          {getVoteDisplay(vote, item)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={summaryStyles.editButton}
                    onPress={() => onEditItem(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={summaryStyles.actions}>
          <TouchableOpacity
            style={summaryStyles.printButton}
            onPress={onPrint}
            activeOpacity={0.8}
          >
            <Ionicons name="print-outline" size={22} color={Colors.white} />
            <Text style={summaryStyles.printButtonText}>Print Ballot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={summaryStyles.startOverButton}
            onPress={onStartOver}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.gray[600]} />
            <Text style={summaryStyles.startOverText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={summaryStyles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.gray[400]} />
          <Text style={summaryStyles.disclaimerText}>
            This is a preview of your selections. Take this to your polling place or use it as a reference when completing your official ballot.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray[900],
    textAlign: 'center',
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 21,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    lineHeight: 20,
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteText: {
    fontSize: 14,
    fontWeight: '700',
  },
  skippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skippedText: {
    fontSize: 14,
    color: Colors.gray[400],
    fontStyle: 'italic',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  printButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    gap: 8,
  },
  startOverText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray[100],
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 40,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray[500],
    lineHeight: 19,
  },
});

const navStyles = StyleSheet.create({
  container: { gap: 12, paddingTop: 8 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryDisabled: { backgroundColor: Colors.gray[300] },
  primaryText: { fontSize: 17, fontWeight: '700', color: Colors.white },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    gap: 6,
  },
  secondaryDisabled: { borderColor: Colors.gray[200] },
  secondaryText: { fontSize: 15, fontWeight: '600', color: Colors.gray[600] },
  secondaryTextDisabled: { color: Colors.gray[300] },
});

// ===========================================
// Main Ballot Screen
// ===========================================

export default function BallotBuilderScreen() {
  const { profile, spec, isLoading, updateAxisValue } = useBlueprint();

  // Ballot data from API
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBallotLoading, setIsBallotLoading] = useState(true);
  const [ballotError, setBallotError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedVotes, setSavedVotes] = useState<UserVote[]>([]);
  const [currentVote, setCurrentVote] = useState<VoteChoice>(null);
  const [writeInName, setWriteInName] = useState('');
  const [valuesExpanded, setValuesExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch ballot data from API
  useEffect(() => {
    async function fetchBallot() {
      try {
        setIsBallotLoading(true);
        setBallotError(null);
        const ballot = await ballotApi.getDefault();
        const { categories: fetchedCategories, items } = transformBallot(ballot);
        setBallotItems(items);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch ballot:', error);
        setBallotError('Failed to load ballot data');
      } finally {
        setIsBallotLoading(false);
      }
    }
    fetchBallot();
  }, []);

  // Derive ValueAxis[] from profile + spec
  const userAxes = useMemo((): ValueAxis[] => {
    if (!profile || !spec) return [];
    const result: ValueAxis[] = [];
    for (const domain of profile.domains) {
      for (const axis of domain.axes) {
        const axisDef = spec.axes.find(a => a.id === axis.axis_id);
        if (axisDef) {
          result.push({
            id: axis.axis_id,
            name: axisDef.name,
            description: axisDef.description,
            value: axis.value_0_10,
            poleA: axisDef.poleA.label,
            poleB: axisDef.poleB.label,
            weight: (axis.importance ?? 5) / 10, // Normalize importance (0-10) to weight (0-1)
          });
        }
      }
    }
    return result;
  }, [profile, spec]);

  const currentItem = ballotItems[currentIndex];
  const currentCategory = categories.find(c => c.id === currentItem?.categoryId) || categories[0];
  const categoryItems = ballotItems.filter(i => i.categoryId === currentCategory?.id);
  const categoryIndex = categoryItems.findIndex(i => i.id === currentItem?.id);

  // Compute recommendations
  const propositionRec = useMemo(() => {
    if (!currentItem || currentItem.type !== 'proposition') {
      return { vote: null, confidence: 0, explanation: '', factors: [], breakdown: [] };
    }
    return computePropositionRecommendation(currentItem, userAxes);
  }, [currentItem, userAxes]);

  const candidateMatches = useMemo(() => {
    if (!currentItem || currentItem.type !== 'candidate_race') {
      return [];
    }
    return computeCandidateMatches(currentItem, userAxes);
  }, [currentItem, userAxes]);

  // Restore saved vote when navigating
  const restoreVote = useCallback((itemId: string) => {
    const saved = savedVotes.find(v => v.itemId === itemId);
    if (saved) {
      setCurrentVote(saved.choice);
      setWriteInName(saved.writeInName || '');
    } else {
      setCurrentVote(null);
      setWriteInName('');
    }
  }, [savedVotes]);

  const handleValueChange = useCallback((axisId: string, value: number) => {
    updateAxisValue(axisId, value);
  }, [updateAxisValue]);

  const handleVoteSelect = useCallback((choice: VoteChoice) => {
    setCurrentVote(choice);
  }, []);

  const saveCurrentVote = useCallback(() => {
    if (!currentItem || !currentVote) return;
    const vote: UserVote = {
      itemId: currentItem.id,
      choice: currentVote,
      writeInName: currentVote === 'write_in' ? writeInName : undefined,
      timestamp: new Date().toISOString(),
    };
    setSavedVotes(prev => [...prev.filter(v => v.itemId !== currentItem.id), vote]);
  }, [currentItem, currentVote, writeInName]);

  const handleNext = useCallback(() => {
    saveCurrentVote();
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setValuesExpanded(false);
    } else {
      // Show summary screen when finished
      setShowSummary(true);
    }
  }, [currentIndex, saveCurrentVote, restoreVote, ballotItems]);

  // Jump to a specific ballot item (for editing from summary)
  const handleEditItem = useCallback((itemIndex: number) => {
    setCurrentIndex(itemIndex);
    restoreVote(ballotItems[itemIndex].id);
    setShowSummary(false);
    setValuesExpanded(false);
  }, [restoreVote, ballotItems]);

  // Start over - reset everything
  const handleStartOver = useCallback(() => {
    setCurrentIndex(0);
    setSavedVotes([]);
    setCurrentVote(null);
    setWriteInName('');
    setShowSummary(false);
    setValuesExpanded(false);
  }, []);

  // Print handler (non-functional for prototype)
  const handlePrint = useCallback(() => {
    alert('Print functionality would open a print-friendly version of your ballot selections.');
  }, []);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      restoreVote(ballotItems[prevIndex].id);
      setValuesExpanded(false);
    }
  }, [currentIndex, restoreVote, ballotItems]);

  const handleSkip = useCallback(() => {
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setCurrentVote(null);
      setWriteInName('');
      setValuesExpanded(false);
    }
  }, [currentIndex, restoreVote, ballotItems]);

  // Loading state
  if (isLoading || isBallotLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your ballot...</Text>
      </View>
    );
  }

  // Error state
  if (ballotError) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.loadingText}>{ballotError}</Text>
      </View>
    );
  }

  if (!currentItem || ballotItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No ballot items available</Text>
      </View>
    );
  }

  // Show summary screen when finished
  if (showSummary) {
    return (
      <BallotSummary
        votes={savedVotes}
        ballotItems={ballotItems}
        categories={categories}
        onEditItem={handleEditItem}
        onStartOver={handleStartOver}
        onPrint={handlePrint}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ballot Builder</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CategoryHeader
          category={currentCategory}
          currentIndex={categoryIndex}
          total={categoryItems.length}
        />

        <BallotItemHeader item={currentItem} />

        {/* Recommendation Section */}
        {currentItem.type === 'proposition' && (
          <RecommendationBanner recommendation={propositionRec} />
        )}

        {/* Vote Selection */}
        {currentItem.type === 'proposition' ? (
          <PropositionVoteButtons
            selected={currentVote}
            onSelect={handleVoteSelect}
            recommendation={propositionRec}
          />
        ) : (
          <CandidateVoteButtons
            candidates={currentItem.candidates || []}
            allowWriteIn={currentItem.allowWriteIn || false}
            selected={currentVote}
            writeInName={writeInName}
            matches={candidateMatches}
            onSelect={handleVoteSelect}
            onWriteInChange={setWriteInName}
          />
        )}

        {/* Values Section (expandable) */}
        {currentItem.relevantAxes && currentItem.relevantAxes.length > 0 && (
          <ValuesSection
            axes={userAxes}
            relevantAxisIds={currentItem.relevantAxes}
            onValueChange={handleValueChange}
            expanded={valuesExpanded}
            onToggle={() => setValuesExpanded(!valuesExpanded)}
          />
        )}

        <NavigationButtons
          canGoBack={currentIndex > 0}
          hasSelection={currentVote !== null && (currentVote !== 'write_in' || writeInName.trim() !== '')}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentIndex === ballotItems.length - 1}
        />
      </ScrollView>
    </View>
  );
}

// ===========================================
// Main Styles
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray[500],
  },
});
