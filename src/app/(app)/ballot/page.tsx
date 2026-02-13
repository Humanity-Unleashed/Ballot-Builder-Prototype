'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  useUserStore,
  selectHasHydrated,
  selectHasCompletedAssessment,
  selectBlueprintProfile,
  selectSpec,
} from '@/stores/userStore';
import { useDemographicStore } from '@/stores/demographicStore';
import {
  useBallotStore,
  selectBallotHasHydrated,
  selectSavedVotes,
  selectCurrentIndex,
  selectShowSummary,
} from '@/stores/ballotStore';
import { ballotApi } from '@/services/api';
import {
  transformBallot,
  computePropositionRecommendation,
  computeCandidateMatches,
  computeDemographicInsights,
  type BallotItem,
  type Category,
  type UserVote,
  type VoteChoice,
  type ValueAxis,
} from '@/lib/ballotHelpers';
import type { BlueprintProfile } from '@/types/blueprintProfile';
import type { Spec } from '@/types/civicAssessment';

import { useFeedbackScreen } from '@/context/FeedbackScreenContext';
import BallotItemHeader from '@/components/ballot/BallotItemHeader';
import RecommendationBanner from '@/components/ballot/RecommendationBanner';
import PersonalImpactSection from '@/components/ballot/PersonalImpactSection';
import PropositionVoteButtons from '@/components/ballot/PropositionVoteButtons';
import CandidateVoteButtons from '@/components/ballot/CandidateVoteButtons';
import NavigationButtons from '@/components/ballot/NavigationButtons';
import BallotNavigator from '@/components/ballot/BallotNavigator';
import BallotSummary from '@/components/ballot/BallotSummary';
import ValuesSection from '@/components/ballot/ValuesSection';
import DemographicSection from '@/components/ballot/DemographicSection';

// =============================================
// Main Ballot Page Orchestrator
// =============================================

/** Convert blueprint profile axes to ValueAxis[] for recommendation functions */
function profileToValueAxes(profile: BlueprintProfile, spec: Spec): ValueAxis[] {
  const axes: ValueAxis[] = [];
  for (const domain of profile.domains) {
    for (const axis of domain.axes) {
      const axisDef = spec.axes.find((a) => a.id === axis.axis_id);
      if (!axisDef) continue;
      axes.push({
        id: axis.axis_id,
        name: axisDef.name,
        description: axisDef.description,
        value: axis.value_0_10,
        poleA: axisDef.poleA.label,
        poleB: axisDef.poleB.label,
        weight: (axis.importance ?? 5) / 5, // normalize 0-10 → 0-2 weight
      });
    }
  }
  return axes;
}

export default function BallotPage() {
  // Blueprint profile store
  const hasHydrated = useUserStore(selectHasHydrated);
  const hasCompletedAssessment = useUserStore(selectHasCompletedAssessment);
  const blueprintProfile = useUserStore(selectBlueprintProfile);
  const blueprintSpec = useUserStore(selectSpec);

  // Demographic profile store
  const demographicProfile = useDemographicStore((s) => s.profile);
  const demographicsWasSkipped = useDemographicStore((s) => s.wasSkipped);

  // Derive value axes from blueprint profile
  const valueAxes = useMemo(() => {
    if (!blueprintProfile || !blueprintSpec) return [];
    return profileToValueAxes(blueprintProfile, blueprintSpec);
  }, [blueprintProfile, blueprintSpec]);

  // Ballot store (persisted)
  const ballotHydrated = useBallotStore(selectBallotHasHydrated);
  const savedVotes = useBallotStore(selectSavedVotes);
  const currentIndex = useBallotStore(selectCurrentIndex);
  const showSummary = useBallotStore(selectShowSummary);
  const saveVote = useBallotStore((s) => s.saveVote);
  const setCurrentIndex = useBallotStore((s) => s.setCurrentIndex);
  const setShowSummary = useBallotStore((s) => s.setShowSummary);
  const clearBallot = useBallotStore((s) => s.clearBallot);
  const getVoteForItem = useBallotStore((s) => s.getVoteForItem);

  // Ballot data from API
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBallotLoading, setIsBallotLoading] = useState(true);
  const [ballotError, setBallotError] = useState<string | null>(null);

  // Ephemeral UI state (current selection before saving)
  const [currentVote, setCurrentVote] = useState<VoteChoice>(null);
  const [writeInName, setWriteInName] = useState('');
  const [valuesExpanded, setValuesExpanded] = useState(false);
  const [demographicExpanded, setDemographicExpanded] = useState(false);

  // Feedback screen context
  const { setScreenLabel } = useFeedbackScreen();

  // --------------------------------------------------
  // Fetch ballot data from API on mount
  // --------------------------------------------------
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

  // Restore current vote from persisted store after ballot loads
  useEffect(() => {
    if (ballotItems.length === 0 || !ballotHydrated) return;
    const saved = getVoteForItem(ballotItems[currentIndex]?.id);
    if (saved) {
      setCurrentVote(saved.choice);
      setWriteInName(saved.writeInName || '');
    }
  }, [ballotItems, ballotHydrated, currentIndex, getVoteForItem]);

  const currentItem = ballotItems[currentIndex];

  // Update feedback screen label based on current sub-screen
  useEffect(() => {
    if (!hasHydrated || !ballotHydrated || isBallotLoading) {
      setScreenLabel('Ballot - Loading');
    } else if (!hasCompletedAssessment || valueAxes.length === 0) {
      setScreenLabel('Ballot - Needs Blueprint');
    } else if (ballotError) {
      setScreenLabel('Ballot - Error');
    } else if (showSummary) {
      setScreenLabel('Ballot - Summary');
    } else if (currentItem) {
      setScreenLabel(`Ballot - Item ${currentIndex + 1}/${ballotItems.length}`);
    } else {
      setScreenLabel('Ballot');
    }
  }, [
    hasHydrated, ballotHydrated, isBallotLoading, hasCompletedAssessment, valueAxes.length,
    ballotError, showSummary, currentItem, currentIndex, ballotItems.length,
    setScreenLabel,
  ]);

  // --------------------------------------------------
  // Value-based recommendation computations
  // --------------------------------------------------
  const propositionRec = useMemo(() => {
    if (!currentItem || currentItem.type !== 'proposition' || valueAxes.length === 0) {
      return { vote: null, confidence: 0, explanation: '', factors: [], breakdown: [] };
    }
    return computePropositionRecommendation(currentItem, valueAxes);
  }, [currentItem, valueAxes]);

  // Generate value framing from the recommendation breakdown
  const propositionValueFraming = useMemo(() => {
    if (!propositionRec.breakdown || propositionRec.breakdown.length === 0) {
      return { resonance: [] as string[], tension: [] as string[] };
    }
    const resonance: string[] = [];
    const tension: string[] = [];
    for (const item of propositionRec.breakdown) {
      if (item.alignment === 'yes' && propositionRec.vote === 'yes') {
        resonance.push(`Supports your stance on ${item.axisName}`);
      } else if (item.alignment === 'no' && propositionRec.vote === 'no') {
        resonance.push(`Aligns with your stance on ${item.axisName}`);
      } else if (item.alignment === 'yes' && propositionRec.vote === 'no') {
        tension.push(`Conflicts with ${item.axisName}`);
      } else if (item.alignment === 'no' && propositionRec.vote === 'yes') {
        tension.push(`Some tension with ${item.axisName}`);
      }
    }
    return { resonance: resonance.slice(0, 2), tension: tension.slice(0, 2) };
  }, [propositionRec]);

  const candidateMatches = useMemo(() => {
    if (!currentItem || currentItem.type !== 'candidate_race' || valueAxes.length === 0) {
      return [];
    }
    return computeCandidateMatches(currentItem, valueAxes);
  }, [currentItem, valueAxes]);

  // --------------------------------------------------
  // Demographic-based personal impact insights
  // --------------------------------------------------
  const personalImpacts = useMemo(() => {
    if (!currentItem || demographicsWasSkipped) return [];
    return computeDemographicInsights(currentItem.id, demographicProfile);
  }, [currentItem, demographicProfile, demographicsWasSkipped]);

  // --------------------------------------------------
  // Vote management helpers
  // --------------------------------------------------
  const restoreVote = useCallback(
    (itemId: string) => {
      const saved = getVoteForItem(itemId);
      if (saved) {
        setCurrentVote(saved.choice);
        setWriteInName(saved.writeInName || '');
      } else {
        setCurrentVote(null);
        setWriteInName('');
      }
    },
    [getVoteForItem]
  );

  const handleValueChange = useCallback((axisId: string, value: number) => {
    useUserStore.getState().updateAxisValue(axisId, value);
  }, []);

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
    saveVote(vote);
  }, [currentItem, currentVote, writeInName, saveVote]);

  // --------------------------------------------------
  // Navigation handlers
  // --------------------------------------------------
  const handleNext = useCallback(() => {
    saveCurrentVote();
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
    } else {
      setShowSummary(true);
    }
  }, [currentIndex, saveCurrentVote, restoreVote, ballotItems, setCurrentIndex, setShowSummary]);

  const handleEditItem = useCallback(
    (itemIndex: number) => {
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setShowSummary(false);
    },
    [restoreVote, ballotItems, setCurrentIndex, setShowSummary]
  );

  const handleJumpTo = useCallback(
    (itemIndex: number) => {
      if (currentVote) {
        saveCurrentVote();
      }
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
    },
    [currentVote, saveCurrentVote, restoreVote, ballotItems, setCurrentIndex]
  );

  const handleStartOver = useCallback(() => {
    clearBallot();
    setCurrentVote(null);
    setWriteInName('');
  }, [clearBallot]);

  const handlePrint = useCallback(() => {
    alert(
      'Print functionality would open a print-friendly version of your ballot selections.'
    );
  }, []);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      restoreVote(ballotItems[prevIndex].id);
    }
  }, [currentIndex, restoreVote, ballotItems, setCurrentIndex]);

  const handleSkip = useCallback(() => {
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setCurrentVote(null);
      setWriteInName('');
    }
  }, [currentIndex, restoreVote, ballotItems, setCurrentIndex]);

  // --------------------------------------------------
  // Loading / error states
  // --------------------------------------------------
  if (!hasHydrated || !ballotHydrated || isBallotLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        <p className="text-base text-gray-500">Loading your ballot...</p>
      </div>
    );
  }

  // Check if user has completed the blueprint assessment
  if (!hasCompletedAssessment || valueAxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900">Complete Your Blueprint First</h2>
        <p className="text-center text-gray-600 max-w-sm">
          To get personalized voting recommendations, please complete your civic blueprint assessment first.
        </p>
        <a
          href="/blueprint"
          className="mt-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
        >
          Go to Blueprint
        </a>
      </div>
    );
  }

  if (ballotError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-base text-gray-500">{ballotError}</p>
      </div>
    );
  }

  if (!currentItem || ballotItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-base text-gray-500">No ballot items available</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Summary view
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Main ballot builder view
  // --------------------------------------------------
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden -mx-4 bg-gray-50">
      {/* Ballot Navigator (progress bar) */}
      <BallotNavigator
        ballotItems={ballotItems}
        savedVotes={savedVotes}
        currentIndex={currentIndex}
        onJumpTo={handleJumpTo}
      />

      {/* Scrollable ballot content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-4">
        <BallotItemHeader item={currentItem} />

        {/* Recommendation section (propositions only) */}
        {currentItem.type === 'proposition' && (
          <RecommendationBanner
            recommendation={propositionRec}
            valueFraming={propositionValueFraming}
          />
        )}

        {/* Demographic-based personal impact insights */}
        <PersonalImpactSection impacts={personalImpacts} />

        {/* Vote selection */}
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

        {/* Adjust your values */}
        <ValuesSection
          axes={valueAxes}
          relevantAxisIds={currentItem.relevantAxes || []}
          onValueChange={handleValueChange}
          expanded={valuesExpanded}
          onToggle={() => setValuesExpanded((v) => !v)}
        />

        {/* Adjust your profile (demographics) */}
        <DemographicSection
          expanded={demographicExpanded}
          onToggle={() => setDemographicExpanded((v) => !v)}
        />
      </div>

      {/* Sticky navigation buttons */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 pb-4 pt-3">
        <NavigationButtons
          canGoBack={currentIndex > 0}
          hasSelection={
            currentVote !== null && (currentVote !== 'write_in' || writeInName.trim() !== '')
          }
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentIndex === ballotItems.length - 1}
        />
      </div>
    </div>
  );
}
