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
  Modal,
  Pressable,
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
// --- Proposition Breakdown Bottom Sheet ---
function PropositionBreakdownSheet({
  visible,
  recommendation,
  onClose,
}: {
  visible: boolean;
  recommendation: PropositionRecommendation;
  onClose: () => void;
}) {
  if (!recommendation || recommendation.breakdown.length === 0) return null;

  const isYes = recommendation.vote === 'yes';
  const accentColor = !recommendation.vote ? Colors.gray[600] : isYes ? '#16A34A' : '#DC2626';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={sheetStyles.overlay} onPress={onClose}>
        <Pressable style={sheetStyles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={sheetStyles.handleBar} />

          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.headerTitle}>How we calculated this</Text>
            <TouchableOpacity style={sheetStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={sheetStyles.content} showsVerticalScrollIndicator={false}>
            <Text style={sheetStyles.intro}>
              We compare your values to what YES and NO mean for this measure:
            </Text>

            {recommendation.breakdown.map(axis => (
              <View key={axis.axisId} style={propSheetStyles.breakdownItem}>
                <Text style={propSheetStyles.axisName}>{axis.axisName}</Text>

                <View style={propSheetStyles.stanceRow}>
                  <Ionicons name="person" size={14} color={Colors.primary} />
                  <Text style={propSheetStyles.stanceLabel}>Your stance:</Text>
                  <Text style={propSheetStyles.stanceValue}>{axis.userStanceLabel}</Text>
                </View>

                <View style={propSheetStyles.stanceRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={propSheetStyles.stanceLabel}>YES means:</Text>
                  <Text style={propSheetStyles.stanceValue}>{axis.yesAlignsWith}</Text>
                </View>

                <View style={propSheetStyles.stanceRow}>
                  <Ionicons name="close-circle" size={14} color="#EF4444" />
                  <Text style={propSheetStyles.stanceLabel}>NO means:</Text>
                  <Text style={propSheetStyles.stanceValue}>{axis.noAlignsWith}</Text>
                </View>

                <View style={[
                  propSheetStyles.alignmentBadge,
                  axis.alignment === 'yes' && propSheetStyles.alignmentYes,
                  axis.alignment === 'no' && propSheetStyles.alignmentNo,
                  axis.alignment === 'neutral' && propSheetStyles.alignmentNeutral,
                ]}>
                  <Text style={propSheetStyles.alignmentText}>
                    {axis.alignment === 'yes' ? '→ Your values suggest YES' :
                     axis.alignment === 'no' ? '→ Your values suggest NO' :
                     '→ Neutral on this issue'}
                  </Text>
                </View>
              </View>
            ))}

            <View style={propSheetStyles.summary}>
              <Text style={propSheetStyles.summaryText}>
                Overall: {recommendation.breakdown.filter(a => a.alignment === 'yes').length} value(s) suggest YES, {' '}
                {recommendation.breakdown.filter(a => a.alignment === 'no').length} suggest NO
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const propSheetStyles = StyleSheet.create({
  breakdownItem: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gray[300],
  },
  axisName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  stanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stanceLabel: {
    fontSize: 13,
    color: Colors.gray[500],
    width: 85,
  },
  stanceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
    flex: 1,
    lineHeight: 18,
  },
  alignmentBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  summary: {
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

function RecommendationBanner({
  recommendation
}: {
  recommendation: PropositionRecommendation
}) {
  const [showSheet, setShowSheet] = useState(false);

  if (!recommendation.vote || recommendation.confidence < 0.2) {
    return (
      <View style={[recStyles.banner, recStyles.neutralBanner]}>
        <View style={recStyles.bannerHeader}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.gray[500]} />
          <Text style={recStyles.neutralTitle}>Close Call</Text>
        </View>
        <Text style={recStyles.bannerText}>{recommendation.explanation}</Text>

        {/* How we calculated - opens bottom sheet */}
        {recommendation.breakdown.length > 0 && (
          <TouchableOpacity
            style={recStyles.howButton}
            onPress={() => setShowSheet(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calculator-outline" size={14} color="#3B82F6" />
            <Text style={recStyles.howButtonText}>How we calculated this</Text>
            <Ionicons name="open-outline" size={14} color="#3B82F6" />
          </TouchableOpacity>
        )}

        <PropositionBreakdownSheet
          visible={showSheet}
          recommendation={recommendation}
          onClose={() => setShowSheet(false)}
        />
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

      {/* How we calculated - opens bottom sheet */}
      {recommendation.breakdown.length > 0 && (
        <TouchableOpacity
          style={recStyles.howButton}
          onPress={() => setShowSheet(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calculator-outline" size={14} color="#3B82F6" />
          <Text style={recStyles.howButtonText}>How we calculated this</Text>
          <Ionicons name="open-outline" size={14} color="#3B82F6" />
        </TouchableOpacity>
      )}

      <PropositionBreakdownSheet
        visible={showSheet}
        recommendation={recommendation}
        onClose={() => setShowSheet(false)}
      />
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
  // Link to open breakdown sheet (matches candidate compare link)
  howButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  howButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
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

// --- Candidate Comparison Bottom Sheet ---
function CandidateComparisonSheet({
  visible,
  candidate,
  match,
  onClose,
}: {
  visible: boolean;
  candidate: Candidate | null;
  match: CandidateMatch | undefined;
  onClose: () => void;
}) {
  if (!candidate || !match) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={sheetStyles.overlay} onPress={onClose}>
        <Pressable style={sheetStyles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={sheetStyles.handleBar} />

          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.headerTitle}>Comparing with {candidate.name}</Text>
            <TouchableOpacity style={sheetStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={sheetStyles.content} showsVerticalScrollIndicator={false}>
            <Text style={sheetStyles.intro}>
              Based on the values you shared, here's how you compare:
            </Text>

            {match.axisComparisons.map(comparison => {
              const isAgreement = comparison.alignment === 'strong' || comparison.alignment === 'moderate';
              const alignmentIcon = isAgreement ? 'checkmark-circle' : 'close-circle';
              const alignmentColor = isAgreement ? '#22C55E' : '#EF4444';

              return (
                <View key={comparison.axisId} style={sheetStyles.comparisonItem}>
                  <View style={sheetStyles.comparisonHeader}>
                    <Ionicons name={alignmentIcon} size={18} color={alignmentColor} />
                    <Text style={sheetStyles.comparisonAxisName}>{comparison.axisName}</Text>
                  </View>

                  <View style={sheetStyles.stanceComparison}>
                    <View style={sheetStyles.stanceRow}>
                      <Text style={sheetStyles.stanceWho}>You:</Text>
                      <Text style={sheetStyles.stanceText}>{comparison.userLabel}</Text>
                    </View>
                    <View style={sheetStyles.stanceRow}>
                      <Text style={sheetStyles.stanceWho}>{candidate.name.split(' ')[0]}:</Text>
                      <Text style={sheetStyles.stanceText}>{comparison.candidateLabel}</Text>
                    </View>
                  </View>

                  <Text style={[sheetStyles.comparisonSummary, { color: alignmentColor }]}>
                    {isAgreement
                      ? '✓ You share similar views on this'
                      : '✗ You have different perspectives here'}
                  </Text>
                </View>
              );
            })}

            <View style={sheetStyles.matchSummary}>
              <Text style={sheetStyles.matchSummaryText}>
                You align on {match.axisComparisons.filter(c => c.alignment === 'strong' || c.alignment === 'moderate').length} of {match.axisComparisons.length} policy areas
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 34,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray[900],
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  intro: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 16,
    fontStyle: 'italic',
  },
  comparisonItem: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  comparisonAxisName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[800],
  },
  stanceComparison: {
    gap: 8,
    paddingLeft: 28,
  },
  stanceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stanceWho: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
    width: 55,
  },
  stanceText: {
    fontSize: 13,
    color: Colors.gray[700],
    flex: 1,
    lineHeight: 18,
  },
  comparisonSummary: {
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: 28,
    marginTop: 2,
  },
  matchSummary: {
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    marginTop: 4,
  },
  matchSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

// --- Candidate Card (compact, with link to open sheet) ---
function CandidateCard({
  candidate,
  isSelected,
  match,
  onSelect,
  onCompare,
}: {
  candidate: Candidate;
  isSelected: boolean;
  match: CandidateMatch | undefined;
  onSelect: () => void;
  onCompare: () => void;
}) {
  const matchPercent = match?.matchPercent || 0;
  const isBestMatch = match?.isBestMatch || false;

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

          {/* Match info - based on user's values */}
          {match && (match.keyAgreements.length > 0 || match.keyDisagreements.length > 0) && (
            <View style={candStyles.matchInfoContainer}>
              {match.keyAgreements.length > 0 && (
                <Text style={candStyles.matchDetail}>
                  Shares your views on {match.keyAgreements.join(', ')}
                </Text>
              )}
              {match.keyDisagreements.length > 0 && (
                <Text style={candStyles.matchWarning}>
                  Differs on {match.keyDisagreements.join(', ')}
                </Text>
              )}
            </View>
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

      {/* Link to open comparison sheet */}
      {match && match.axisComparisons.length > 0 && (
        <TouchableOpacity
          style={candStyles.compareLink}
          onPress={onCompare}
          activeOpacity={0.7}
        >
          <Ionicons name="analytics-outline" size={14} color="#3B82F6" />
          <Text style={candStyles.compareLinkText}>See how we compare</Text>
          <Ionicons name="open-outline" size={14} color="#3B82F6" />
        </TouchableOpacity>
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
  const [compareCandidate, setCompareCandidate] = useState<Candidate | null>(null);
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
      <Text style={candStyles.sublabel}>
        Match scores reflect how closely each candidate aligns with the values you shared in your Civic Blueprint
      </Text>

      <View style={candStyles.list}>
        {sortedCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selected === candidate.id}
            match={getMatch(candidate.id)}
            onSelect={() => onSelect(candidate.id)}
            onCompare={() => setCompareCandidate(candidate)}
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

      {/* Comparison Bottom Sheet */}
      <CandidateComparisonSheet
        visible={compareCandidate !== null}
        candidate={compareCandidate}
        match={compareCandidate ? getMatch(compareCandidate.id) : undefined}
        onClose={() => setCompareCandidate(null)}
      />
    </View>
  );
}

const candStyles = StyleSheet.create({
  container: { gap: 12 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.gray[500], letterSpacing: 0.5 },
  sublabel: { fontSize: 12, color: Colors.gray[500], lineHeight: 16, marginTop: -4 },
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
  matchInfoContainer: { marginTop: 6, gap: 2 },
  matchDetail: { fontSize: 11, color: '#16A34A', lineHeight: 15 },
  matchWarning: { fontSize: 11, color: '#F59E0B', lineHeight: 15 },
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
  // Compare link styles (opens bottom sheet)
  compareLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  compareLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
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

// --- Ballot Navigator (shows official ballot at top) ---
function BallotNavigator({
  ballotItems,
  savedVotes,
  currentIndex,
  onJumpTo,
}: {
  ballotItems: BallotItem[];
  savedVotes: UserVote[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
}) {
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Get status for each item
  const getItemStatus = (item: BallotItem, index: number): 'completed' | 'current' | 'pending' => {
    if (index === currentIndex) return 'current';
    const vote = savedVotes.find(v => v.itemId === item.id);
    return vote ? 'completed' : 'pending';
  };

  // Get choice display for mini ovals
  const getChoiceDisplay = (item: BallotItem): { label: string; filled: boolean }[] => {
    const vote = savedVotes.find(v => v.itemId === item.id);

    if (item.type === 'proposition') {
      return [
        { label: 'YES', filled: vote?.choice === 'yes' },
        { label: 'NO', filled: vote?.choice === 'no' },
      ];
    } else if (item.candidates && item.candidates.length > 0) {
      // Show first two candidates
      return item.candidates.slice(0, 2).map(c => ({
        label: c.name.split(' ').pop() || c.name, // Last name
        filled: vote?.choice === c.id,
      }));
    }
    return [];
  };

  // Scroll to current item when it changes
  React.useEffect(() => {
    if (scrollViewRef.current) {
      // Each card is ~140px wide + 10px gap
      const scrollX = Math.max(0, currentIndex * 150 - 20);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [currentIndex]);

  return (
    <View style={ballotNavStyles.container}>
      <View style={ballotNavStyles.header}>
        <View style={ballotNavStyles.titleRow}>
          <Ionicons name="document-text" size={14} color="#fff" />
          <Text style={ballotNavStyles.title}>Your Official Ballot</Text>
        </View>
        <View style={ballotNavStyles.verifiedBadge}>
          <Ionicons name="checkmark" size={10} color="#6EE7B7" />
          <Text style={ballotNavStyles.verifiedText}>Verified</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ballotNavStyles.scrollContent}
      >
        {ballotItems.map((item, index) => {
          const status = getItemStatus(item, index);
          const choices = getChoiceDisplay(item);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                ballotNavStyles.card,
                status === 'current' && ballotNavStyles.cardCurrent,
                status === 'completed' && ballotNavStyles.cardCompleted,
              ]}
              onPress={() => onJumpTo(index)}
              activeOpacity={0.8}
            >
              <View style={ballotNavStyles.cardHeader}>
                <Text style={ballotNavStyles.cardTitle} numberOfLines={1}>
                  {item.title.toUpperCase()}
                </Text>
                <View style={[
                  ballotNavStyles.statusBadge,
                  status === 'current' && ballotNavStyles.statusCurrent,
                  status === 'completed' && ballotNavStyles.statusCompleted,
                  status === 'pending' && ballotNavStyles.statusPending,
                ]}>
                  {status === 'completed' ? (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  ) : (
                    <Text style={ballotNavStyles.statusNumber}>{index + 1}</Text>
                  )}
                </View>
              </View>

              <Text style={ballotNavStyles.cardText} numberOfLines={2}>
                {item.questionText}
              </Text>

              <View style={ballotNavStyles.choicesRow}>
                {choices.map((choice, i) => (
                  <View key={i} style={ballotNavStyles.miniChoice}>
                    <View style={[
                      ballotNavStyles.miniOval,
                      choice.filled && (status === 'current'
                        ? ballotNavStyles.miniOvalSelected
                        : ballotNavStyles.miniOvalFilled),
                    ]} />
                    <Text style={ballotNavStyles.miniLabel}>{choice.label}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={ballotNavStyles.hint}>← Scroll to see all items • Tap to jump →</Text>
    </View>
  );
}

const ballotNavStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1b4b',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  card: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardCurrent: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCompleted: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    fontFamily: 'serif',
  },
  statusBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCurrent: {
    backgroundColor: '#7C3AED',
  },
  statusCompleted: {
    backgroundColor: '#059669',
  },
  statusPending: {
    backgroundColor: '#e5e7eb',
  },
  statusNumber: {
    fontSize: 8,
    fontWeight: '700',
    color: '#666',
  },
  cardText: {
    fontSize: 7,
    color: '#555',
    lineHeight: 10,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  choicesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniOval: {
    width: 10,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  miniOvalFilled: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  miniOvalSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  miniLabel: {
    fontSize: 7,
    color: '#555',
    fontFamily: 'serif',
  },
  hint: {
    textAlign: 'center',
    fontSize: 10,
    color: '#a5b4fc',
    marginTop: 8,
  },
});

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

  // Jump to a specific ballot item (from navigator)
  const handleJumpTo = useCallback((itemIndex: number) => {
    // Save current vote before jumping
    if (currentVote) {
      saveCurrentVote();
    }
    setCurrentIndex(itemIndex);
    restoreVote(ballotItems[itemIndex].id);
    setValuesExpanded(false);
  }, [currentVote, saveCurrentVote, restoreVote, ballotItems]);

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

      {/* Official Ballot Navigator */}
      <BallotNavigator
        ballotItems={ballotItems}
        savedVotes={savedVotes}
        currentIndex={currentIndex}
        onJumpTo={handleJumpTo}
      />

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
