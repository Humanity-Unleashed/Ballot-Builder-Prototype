'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useBlueprint } from '@/context/BlueprintContext';
import { deriveMetaDimensions } from '@/lib/archetypes';
import { generatePolicyFraming, derivePolicyMetaAlignment } from '@/lib/valueFraming';
import { ballotApi } from '@/services/api';
import {
  transformBallot,
  computePropositionRecommendation,
  computeCandidateMatches,
  type BallotItem,
  type Category,
  type ValueAxis,
  type UserVote,
  type VoteChoice,
} from '@/lib/ballotHelpers';

import BallotItemHeader from '@/components/ballot/BallotItemHeader';
import RecommendationBanner from '@/components/ballot/RecommendationBanner';
import PropositionVoteButtons from '@/components/ballot/PropositionVoteButtons';
import CandidateVoteButtons from '@/components/ballot/CandidateVoteButtons';
import ValuesSection from '@/components/ballot/ValuesSection';
import NavigationButtons from '@/components/ballot/NavigationButtons';
import BallotNavigator from '@/components/ballot/BallotNavigator';
import BallotSummary from '@/components/ballot/BallotSummary';

// =============================================
// Main Ballot Page Orchestrator
// =============================================

export default function BallotPage() {
  const { profile, spec, isLoading, updateAxisValue } = useBlueprint();

  // Ballot data from API
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBallotLoading, setIsBallotLoading] = useState(true);
  const [ballotError, setBallotError] = useState<string | null>(null);

  // UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedVotes, setSavedVotes] = useState<UserVote[]>([]);
  const [currentVote, setCurrentVote] = useState<VoteChoice>(null);
  const [writeInName, setWriteInName] = useState('');
  const [valuesExpanded, setValuesExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  // --------------------------------------------------
  // Derive ValueAxis[] from profile + spec
  // --------------------------------------------------
  const userAxes = useMemo((): ValueAxis[] => {
    if (!profile || !spec) return [];
    const result: ValueAxis[] = [];
    for (const domain of profile.domains) {
      for (const axis of domain.axes) {
        const axisDef = spec.axes.find((a) => a.id === axis.axis_id);
        if (axisDef) {
          result.push({
            id: axis.axis_id,
            name: axisDef.name,
            description: axisDef.description,
            value: axis.value_0_10,
            poleA: axisDef.poleA.label,
            poleB: axisDef.poleB.label,
            weight: (axis.importance ?? 5) / 10,
          });
        }
      }
    }
    return result;
  }, [profile, spec]);

  const metaDimensions = useMemo(() => {
    return profile ? deriveMetaDimensions(profile) : null;
  }, [profile]);

  const currentItem = ballotItems[currentIndex];

  // --------------------------------------------------
  // Recommendation computations
  // --------------------------------------------------
  const propositionRec = useMemo(() => {
    if (!currentItem || currentItem.type !== 'proposition') {
      return { vote: null, confidence: 0, explanation: '', factors: [], breakdown: [] };
    }
    return computePropositionRecommendation(currentItem, userAxes);
  }, [currentItem, userAxes]);

  const propositionValueFraming = useMemo(() => {
    if (
      !currentItem ||
      currentItem.type !== 'proposition' ||
      !metaDimensions ||
      !currentItem.yesAxisEffects
    ) {
      return { resonance: [] as string[], tension: [] as string[] };
    }
    const alignment = derivePolicyMetaAlignment(currentItem.yesAxisEffects);
    return generatePolicyFraming(metaDimensions, alignment);
  }, [currentItem, metaDimensions]);

  const candidateMatches = useMemo(() => {
    if (!currentItem || currentItem.type !== 'candidate_race') {
      return [];
    }
    return computeCandidateMatches(currentItem, userAxes);
  }, [currentItem, userAxes]);

  // --------------------------------------------------
  // Vote management helpers
  // --------------------------------------------------
  const restoreVote = useCallback(
    (itemId: string) => {
      const saved = savedVotes.find((v) => v.itemId === itemId);
      if (saved) {
        setCurrentVote(saved.choice);
        setWriteInName(saved.writeInName || '');
      } else {
        setCurrentVote(null);
        setWriteInName('');
      }
    },
    [savedVotes]
  );

  const handleValueChange = useCallback(
    (axisId: string, value: number) => {
      updateAxisValue(axisId, value);
    },
    [updateAxisValue]
  );

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
    setSavedVotes((prev) => [...prev.filter((v) => v.itemId !== currentItem.id), vote]);
  }, [currentItem, currentVote, writeInName]);

  // --------------------------------------------------
  // Navigation handlers
  // --------------------------------------------------
  const handleNext = useCallback(() => {
    saveCurrentVote();
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setValuesExpanded(false);
    } else {
      setShowSummary(true);
    }
  }, [currentIndex, saveCurrentVote, restoreVote, ballotItems]);

  const handleEditItem = useCallback(
    (itemIndex: number) => {
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setShowSummary(false);
      setValuesExpanded(false);
    },
    [restoreVote, ballotItems]
  );

  const handleJumpTo = useCallback(
    (itemIndex: number) => {
      if (currentVote) {
        saveCurrentVote();
      }
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setValuesExpanded(false);
    },
    [currentVote, saveCurrentVote, restoreVote, ballotItems]
  );

  const handleStartOver = useCallback(() => {
    setCurrentIndex(0);
    setSavedVotes([]);
    setCurrentVote(null);
    setWriteInName('');
    setShowSummary(false);
    setValuesExpanded(false);
  }, []);

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

  // --------------------------------------------------
  // Loading / error states
  // --------------------------------------------------
  if (isLoading || isBallotLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        <p className="text-base text-gray-500">Loading your ballot...</p>
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
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* Ballot Navigator (progress bar) */}
      <BallotNavigator
        ballotItems={ballotItems}
        savedVotes={savedVotes}
        currentIndex={currentIndex}
        onJumpTo={handleJumpTo}
      />

      {/* Scrollable ballot content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10">
        <BallotItemHeader item={currentItem} />

        {/* Recommendation section (propositions only) */}
        {currentItem.type === 'proposition' && (
          <RecommendationBanner
            recommendation={propositionRec}
            valueFraming={propositionValueFraming}
          />
        )}

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
            metaDimensions={metaDimensions}
          />
        )}

        {/* Values section (expandable) */}
        {currentItem.relevantAxes && currentItem.relevantAxes.length > 0 && (
          <ValuesSection
            axes={userAxes}
            relevantAxisIds={currentItem.relevantAxes}
            onValueChange={handleValueChange}
            expanded={valuesExpanded}
            onToggle={() => setValuesExpanded(!valuesExpanded)}
          />
        )}

        {/* Navigation buttons */}
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
