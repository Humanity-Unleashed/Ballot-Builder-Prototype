'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  useSchwartzStore,
  selectHasHydrated,
  selectHasCompletedAssessment,
  selectValueScores,
} from '@/stores/schwartzStore';
import { ballotApi, type BallotMeasure, type BallotCandidate, Ballot, BallotContest } from '@/services/api';
import {
  transformBallot,
  computeValuePropositionRecommendation,
  computeValueCandidateMatches,
  type BallotItem,
  type Category,
  type UserVote,
  type VoteChoice,
} from '@/lib/ballotHelpers';

import BallotItemHeader from '@/components/ballot/BallotItemHeader';
import RecommendationBanner from '@/components/ballot/RecommendationBanner';
import PropositionVoteButtons from '@/components/ballot/PropositionVoteButtons';
import CandidateVoteButtons from '@/components/ballot/CandidateVoteButtons';
import NavigationButtons from '@/components/ballot/NavigationButtons';
import BallotNavigator from '@/components/ballot/BallotNavigator';
import BallotSummary from '@/components/ballot/BallotSummary';

// =============================================
// Main Ballot Page Orchestrator
// =============================================

export default function BallotPage() {
  // Schwartz values store
  const hasHydrated = useSchwartzStore(selectHasHydrated);
  const hasCompletedAssessment = useSchwartzStore(selectHasCompletedAssessment);
  const valueScores = useSchwartzStore(selectValueScores);

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
        setRawBallot(ballot); // Store raw ballot for value-based recommendations
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

  const currentItem = ballotItems[currentIndex];

  // Get the raw ballot data for value-based recommendations
  const [rawBallot, setRawBallot] = useState<Ballot | null>(null);

  // --------------------------------------------------
  // Value-based recommendation computations
  // --------------------------------------------------
  const propositionRec = useMemo(() => {
    if (!currentItem || currentItem.type !== 'proposition' || !rawBallot || valueScores.length === 0) {
      return { vote: null, confidence: 0, explanation: '', topFactors: [], breakdown: [] };
    }
    // Find the raw measure data with yesValueEffects
    const rawMeasure = rawBallot.items.find(
      (item) => item.type === 'measure' && item.id === currentItem.id
    ) as BallotMeasure | undefined;
    if (!rawMeasure) {
      return { vote: null, confidence: 0, explanation: '', topFactors: [], breakdown: [] };
    }
    return computeValuePropositionRecommendation(rawMeasure, valueScores);
  }, [currentItem, rawBallot, valueScores]);

  // Generate value framing from the recommendation breakdown
  const propositionValueFraming = useMemo(() => {
    if (!propositionRec.breakdown || propositionRec.breakdown.length === 0) {
      return { resonance: [] as string[], tension: [] as string[] };
    }
    const resonance: string[] = [];
    const tension: string[] = [];
    for (const item of propositionRec.breakdown) {
      if (item.alignment === 'yes' && propositionRec.vote === 'yes') {
        resonance.push(`Supports your value of ${item.valueName}`);
      } else if (item.alignment === 'no' && propositionRec.vote === 'no') {
        resonance.push(`Aligns with your value of ${item.valueName}`);
      } else if (item.alignment === 'yes' && propositionRec.vote === 'no') {
        tension.push(`Conflicts with ${item.valueName}`);
      } else if (item.alignment === 'no' && propositionRec.vote === 'yes') {
        tension.push(`Some tension with ${item.valueName}`);
      }
    }
    return { resonance: resonance.slice(0, 2), tension: tension.slice(0, 2) };
  }, [propositionRec]);

  const candidateMatches = useMemo(() => {
    if (!currentItem || currentItem.type !== 'candidate_race' || !rawBallot || valueScores.length === 0) {
      return [];
    }
    // Find the raw contest data with candidates
    const rawContest = rawBallot.items.find(
      (item) => item.type === 'candidate' && item.id === currentItem.id
    ) as BallotContest | undefined;
    if (!rawContest || !rawContest.candidates) {
      return [];
    }
    return computeValueCandidateMatches(rawContest.candidates as BallotCandidate[], valueScores);
  }, [currentItem, rawBallot, valueScores]);

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
          } else {
      setShowSummary(true);
    }
  }, [currentIndex, saveCurrentVote, restoreVote, ballotItems]);

  const handleEditItem = useCallback(
    (itemIndex: number) => {
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setShowSummary(false);
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
          },
    [currentVote, saveCurrentVote, restoreVote, ballotItems]
  );

  const handleStartOver = useCallback(() => {
    setCurrentIndex(0);
    setSavedVotes([]);
    setCurrentVote(null);
    setWriteInName('');
    setShowSummary(false);
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
          }
  }, [currentIndex, restoreVote, ballotItems]);

  const handleSkip = useCallback(() => {
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setCurrentVote(null);
      setWriteInName('');
          }
  }, [currentIndex, restoreVote, ballotItems]);

  // --------------------------------------------------
  // Loading / error states
  // --------------------------------------------------
  if (!hasHydrated || isBallotLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        <p className="text-base text-gray-500">Loading your ballot...</p>
      </div>
    );
  }

  // Check if user has completed the blueprint assessment
  if (!hasCompletedAssessment || valueScores.length === 0) {
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
