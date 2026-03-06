'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { ballotApi } from '@/services/api';
import { transformBallot, type BallotItem } from '@/lib/ballotHelpers';
import {
  useConversationStore,
  selectSession,
  selectConversationHasHydrated,
} from '@/stores/conversationStore';
import { useBallotStore } from '@/stores/ballotStore';
import { useUserStore } from '@/stores/userStore';
import { useDemographicStore } from '@/stores/demographicStore';
import type { Ballot } from '@/services/api';
import type { DemoState } from '@/stores/demographicStore';
import WarmupView from '@/components/conversation/WarmupView';
import ConversationView from '@/components/conversation/ConversationView';
import ConversationProgress from '@/components/conversation/ConversationProgress';
import ConversationSummary from '@/components/conversation/ConversationSummary';
import StateSelectView from '@/components/conversation/StateSelectView';
import DemographicGate from '@/components/conversation/DemographicGate';

/** Scan ballot items and collect all axes that actually appear on this ballot */
function collectRelevantAxes(items: BallotItem[]): string[] {
  const axes = new Set<string>();
  for (const item of items) {
    if (item.relevantAxes) {
      for (const a of item.relevantAxes) axes.add(a);
    }
    if (item.yesAxisEffects) {
      for (const a of Object.keys(item.yesAxisEffects)) axes.add(a);
    }
    if (item.type === 'candidate_race' && item.candidates) {
      for (const c of item.candidates) {
        if (c.profile?.stances) {
          for (const a of Object.keys(c.profile.stances)) axes.add(a);
        }
      }
    }
  }
  return Array.from(axes);
}

export default function ConversationPage() {
  const hasHydrated = useConversationStore(selectConversationHasHydrated);
  const session = useConversationStore(selectSession);
  const startSession = useConversationStore((s) => s.startSession);
  const selectState = useConversationStore((s) => s.selectState);
  const completeDemographics = useConversationStore((s) => s.completeDemographics);
  const skipDemographics = useConversationStore((s) => s.skipDemographics);
  const recordVote = useConversationStore((s) => s.recordVote);
  const advanceToNext = useConversationStore((s) => s.advanceToNext);
  const resetSession = useConversationStore((s) => s.resetSession);

  const saveBallotVote = useBallotStore((s) => s.saveVote);
  const userSpec = useUserStore((s) => s.spec);
  const loadSpec = useUserStore((s) => s.loadSpec);

  const demoSetField = useDemographicStore((s) => s.setField);
  const demoSubmitProfile = useDemographicStore((s) => s.submitProfile);
  const demoSkipProfile = useDemographicStore((s) => s.skipProfile);

  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load spec if needed
  useEffect(() => {
    if (!userSpec) {
      loadSpec();
    }
  }, [userSpec, loadSpec]);

  // Initialize an empty session shell on mount (if none exists)
  useEffect(() => {
    if (hasHydrated && !session) {
      startSession();
    }
  }, [hasHydrated, session, startSession]);

  // If resuming a session that already has a ballotId, load that ballot
  useEffect(() => {
    if (
      hasHydrated &&
      session &&
      session.ballotId &&
      session.phase !== 'state-select' &&
      ballotItems.length === 0 &&
      !isLoading
    ) {
      setIsLoading(true);
      ballotApi
        .getById(session.ballotId)
        .then((data) => {
          setBallot(data);
          const { items } = transformBallot(data);
          setBallotItems(items);
        })
        .catch((err) => {
          setError('Failed to load ballot data');
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [hasHydrated, session, ballotItems.length, isLoading]);

  // Handle state selection: fetch ballot, compute axes, transition to demographics
  const handleStateSelected = useCallback(
    async (stateCode: string, ballotId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ballotApi.getById(ballotId);
        setBallot(data);
        const { items } = transformBallot(data);
        setBallotItems(items);

        const relevantAxes = collectRelevantAxes(items);
        const itemIds = items.map((item) => item.id);

        // Persist to demographic store
        demoSetField('selectedState', stateCode as DemoState);
        demoSetField('selectedBallotId', ballotId);

        // Transition session to demographics phase
        selectState(ballotId, itemIds, relevantAxes);
      } catch (err) {
        setError('Failed to load ballot data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectState, demoSetField]
  );

  const handleDemographicsComplete = useCallback(() => {
    demoSubmitProfile();
    completeDemographics();
  }, [demoSubmitProfile, completeDemographics]);

  const handleDemographicsSkip = useCallback(() => {
    demoSkipProfile();
    skipDemographics();
  }, [demoSkipProfile, skipDemographics]);

  const currentItemId = session?.itemOrder[session.currentItemIndex] ?? null;
  const currentBallotItem = useMemo(
    () => ballotItems.find((item) => item.id === currentItemId) ?? null,
    [ballotItems, currentItemId]
  );

  const isComplete = session ? session.currentItemIndex >= session.totalCount : false;

  const handleVoteConfirmed = useCallback((itemId: string, choice: string | null) => {
    recordVote(itemId, choice);
    saveBallotVote({
      itemId,
      choice,
      timestamp: new Date().toISOString(),
    });
    advanceToNext();
  }, [recordVote, saveBallotVote, advanceToNext]);

  const handleSkip = useCallback((itemId: string) => {
    recordVote(itemId, null);
    advanceToNext();
  }, [recordVote, advanceToNext]);

  const handleRestart = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleWarmupComplete = useCallback(() => {
    // warmup → ballot transition is handled by store (finishWarmup sets phase='ballot')
  }, []);

  // Loading state (hydration or ballot fetch in progress)
  if (!hasHydrated || (isLoading && !session)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 px-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-brand-primary font-medium hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  // Phase: State selection
  if (session.phase === 'state-select') {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            <p className="text-sm text-gray-500">Loading ballot...</p>
          </div>
        ) : (
          <StateSelectView onStateSelected={handleStateSelected} />
        )}
        {error && (
          <p className="text-center text-sm text-red-600 py-2">{error}</p>
        )}
      </div>
    );
  }

  // Phase: Demographics gate
  if (session.phase === 'demographics') {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
        <DemographicGate
          relevantAxes={session.relevantAxes}
          onComplete={handleDemographicsComplete}
          onSkip={handleDemographicsSkip}
        />
      </div>
    );
  }

  // Still loading ballot for warmup/ballot phases (e.g., page refresh mid-session)
  if (isLoading || ballotItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500">Loading your ballot...</p>
      </div>
    );
  }

  if (ballotItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 px-4">
        <MessageSquare className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">No ballot items available.</p>
      </div>
    );
  }

  // Phase: Warmup
  if (session.phase === 'warmup') {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
        <WarmupView onWarmupComplete={handleWarmupComplete} ballotItems={ballotItems} />
      </div>
    );
  }

  // Phase: Ballot complete
  if (isComplete) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
        <ConversationSummary session={session} ballotItems={ballotItems} />
        <div className="px-4 pb-6">
          <button
            onClick={handleRestart}
            className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // Phase: Active ballot conversation
  if (!currentBallotItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <ConversationProgress session={session} />
      </div>

      {/* Per-item conversation */}
      <div className="flex-1 overflow-hidden">
        <ConversationView
          key={currentBallotItem.id}
          ballotItem={currentBallotItem}
          axisDefinitions={userSpec?.axes ?? []}
          onVoteConfirmed={handleVoteConfirmed}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
