'use client';

/**
 * Unified Wizard Page — /ballot
 *
 * Merges Blueprint + Build + Chat into a single progressive flow:
 * state-select → demographics → assessment → profile-review → ballot-item → summary
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Hand,
  SlidersHorizontal,
} from 'lucide-react';

// ── Stores ──
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
  selectCurrentPhase,
  selectSavedVotes,
  selectCurrentIndex,
  selectHasSeenIntro,
  type WizardPhase,
} from '@/stores/ballotStore';
import { useActiveTimer } from '@/hooks/useActiveTimer';
import {
  useConversationStore,
  selectConversationHasHydrated,
} from '@/stores/conversationStore';

// ── API + helpers ──
import { ballotApi } from '@/services/api';
import type { Ballot, BallotLookupResponse } from '@/services/api';
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
import type { UserValueRecord } from '@/types/hybridAssessment';
import type { ProgressiveAxisValue } from '@/types/conversation';
import type { DemoState } from '@/stores/demographicStore';
import { getNextElectionDay, daysUntil, formatElectionDate } from '@/lib/electionDate';
import { deriveMetaDimensions, computeArchetype, getArchetypeVariant, getArchetypeDisplayName, getArchetypeDisplayEmoji } from '@/lib/archetypes';
import { calculateFineTunedScore } from '@/data/fineTuningPositions';
import { getFullProfile } from '@/lib/hybridSession';
import { getSliderConfig } from '@/data/sliderPositions';
import { useFeedbackScreen } from '@/context/FeedbackScreenContext';

// ── Phase components ──
import StateSelectView from '@/components/conversation/StateSelectView';
import DemographicGate from '@/components/conversation/DemographicGate';
import HybridAssessmentView from '@/components/assessment/HybridAssessmentView';
import BlueprintSummaryView from '@/components/blueprint/BlueprintSummaryView';
import HybridFineTuningView from '@/components/blueprint/HybridFineTuningView';
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
import DemoBanner from '@/components/ballot/DemoBanner';
import AiAssistantDrawer from '@/components/ballot/AiAssistantDrawer';

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

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
        weight: (axis.importance ?? 5) / 5,
      });
    }
  }
  return axes;
}

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

// ═══════════════════════════════════════════════════════════
// Main Unified Wizard Page
// ═══════════════════════════════════════════════════════════

export default function UnifiedBallotPage() {
  // ── Store selectors ──
  const userHydrated = useUserStore(selectHasHydrated);
  const hasCompletedAssessment = useUserStore(selectHasCompletedAssessment);
  const blueprintProfile = useUserStore(selectBlueprintProfile);
  const blueprintSpec = useUserStore(selectSpec);
  const loadSpec = useUserStore((s) => s.loadSpec);
  const applyHybridProfile = useUserStore((s) => s.applyHybridProfile);
  const updateAxisValue = useUserStore((s) => s.updateAxisValue);
  const updateAxisImportance = useUserStore((s) => s.updateAxisImportance);
  const completeAssessment = useUserStore((s) => s.completeAssessment);
  const savedHybridSession = useUserStore((s) => s.savedHybridSession);
  const clearHybridSession = useUserStore((s) => s.clearHybridSession);

  const demographicProfile = useDemographicStore((s) => s.profile);
  const demographicsWasSkipped = useDemographicStore((s) => s.wasSkipped);
  const demoSetField = useDemographicStore((s) => s.setField);
  const demoSubmitProfile = useDemographicStore((s) => s.submitProfile);
  const demoSkipProfile = useDemographicStore((s) => s.skipProfile);

  // Track active session time (pauses when tab is hidden)
  useActiveTimer();

  const ballotHydrated = useBallotStore(selectBallotHasHydrated);
  const currentPhase = useBallotStore(selectCurrentPhase);
  const savedVotes = useBallotStore(selectSavedVotes);
  const currentIndex = useBallotStore(selectCurrentIndex);
  const hasSeenIntro = useBallotStore(selectHasSeenIntro);
  const setPhase = useBallotStore((s) => s.setPhase);
  const advancePhase = useBallotStore((s) => s.advancePhase);
  const markPhaseCompleted = useBallotStore((s) => s.markPhaseCompleted);
  const saveVote = useBallotStore((s) => s.saveVote);
  const setCurrentIndex = useBallotStore((s) => s.setCurrentIndex);
  const dismissIntro = useBallotStore((s) => s.dismissIntro);
  const clearBallot = useBallotStore((s) => s.clearBallot);
  const getVoteForItem = useBallotStore((s) => s.getVoteForItem);
  const redoVotes = useBallotStore((s) => s.redoVotes);
  const startFresh = useBallotStore((s) => s.startFresh);

  const convHydrated = useConversationStore(selectConversationHasHydrated);
  const updateConvProfile = useConversationStore((s) => s.updateProfile);
  const convSelectState = useConversationStore((s) => s.selectState);
  const convStartSession = useConversationStore((s) => s.startSession);
  const convCompleteDemographics = useConversationStore((s) => s.completeDemographics);
  const convSkipDemographics = useConversationStore((s) => s.skipDemographics);
  const convFinishWarmup = useConversationStore((s) => s.finishWarmup);
  const convSession = useConversationStore((s) => s.session);

  // ── Local state ──
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [ballotItems, setBallotItems] = useState<BallotItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relevantAxes, setRelevantAxes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ballotSource, setBallotSource] = useState<string | null>(null);
  const [location, setLocation] = useState<BallotLookupResponse['location'] | null>(null);
  const [voterInfo, setVoterInfo] = useState<BallotLookupResponse['voterInfo'] | null>(null);

  // Ballot-item phase ephemeral state
  const [currentVote, setCurrentVote] = useState<VoteChoice>(null);
  const [writeInName, setWriteInName] = useState('');
  const [valuesExpanded, setValuesExpanded] = useState(false);
  const [demographicExpanded, setDemographicExpanded] = useState(false);

  // Profile-review sub-state (fine-tuning)
  const [fineTuningAxisId, setFineTuningAxisId] = useState<string | null>(null);
  const [fineTuningResponses, setFineTuningResponses] = useState<
    Record<string, Record<string, number>>
  >({});

  // Resume prompt for saved assessment session
  const [resumeDecision, setResumeDecision] = useState<'pending' | 'resume' | 'fresh'>('pending');

  // AI assistant drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // Two-tier reset confirmation dialogs
  const [showRedoConfirm, setShowRedoConfirm] = useState(false);
  const [showFreshConfirm, setShowFreshConfirm] = useState(false);

  const { setScreenLabel } = useFeedbackScreen();

  // ── Derived state ──
  const valueAxes = useMemo(() => {
    if (!blueprintProfile || !blueprintSpec) return [];
    return profileToValueAxes(blueprintProfile, blueprintSpec);
  }, [blueprintProfile, blueprintSpec]);

  const { daysRemaining, electionLabel } = useMemo(() => {
    const electionDay = getNextElectionDay();
    return {
      daysRemaining: daysUntil(electionDay),
      electionLabel: `Election Day — ${formatElectionDate(electionDay)}`,
    };
  }, []);

  const metaDimensions = useMemo(
    () => (blueprintProfile ? deriveMetaDimensions(blueprintProfile) : null),
    [blueprintProfile]
  );

  const currentItem = ballotItems[currentIndex];

  // ── Load spec on mount ──
  useEffect(() => {
    if (!blueprintSpec) loadSpec();
  }, [blueprintSpec, loadSpec]);

  // ── Initialize conversation session if needed ──
  useEffect(() => {
    if (convHydrated && !convSession) {
      convStartSession();
    }
  }, [convHydrated, convSession, convStartSession]);

  // ── Seed conversation profile from Blueprint assessment ──
  useEffect(() => {
    if (!convSession || !blueprintProfile) return;
    // Only seed if conversation profile is empty (hasn't been populated yet)
    if (Object.keys(convSession.profile).length > 0) return;

    const seeded: Record<string, import('@/types/conversation').ProgressiveAxisValue> = {};
    for (const domain of blueprintProfile.domains) {
      for (const axis of domain.axes) {
        seeded[axis.axis_id] = {
          value: axis.value_0_10,
          confidence: axis.confidence_0_1,
          importance: axis.importance ?? 5,
          signalCount: 1,
        };
      }
    }
    if (Object.keys(seeded).length > 0) {
      updateConvProfile(seeded);
    }
  }, [convSession, blueprintProfile, updateConvProfile]);

  // ── Skip logic: if user returns with assessment already done, jump ahead ──
  useEffect(() => {
    if (!ballotHydrated || !userHydrated) return;
    // If the store says state-select but we already have a completed assessment + ballot selected,
    // skip forward intelligently
    if (currentPhase === 'state-select') {
      const selectedBallotId = demographicProfile.selectedBallotId;
      if (selectedBallotId && hasCompletedAssessment) {
        // User has been here before — load ballot and jump to profile-review or ballot-item
        loadBallotById(selectedBallotId).then(() => {
          setPhase('ballot-item');
          markPhaseCompleted('state-select');
          markPhaseCompleted('demographics');
          markPhaseCompleted('assessment');
          markPhaseCompleted('profile-review');
        });
      } else if (selectedBallotId) {
        // Has ballot but no assessment
        loadBallotById(selectedBallotId).then(() => {
          setPhase('assessment');
          markPhaseCompleted('state-select');
          markPhaseCompleted('demographics');
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballotHydrated, userHydrated]);

  // ── If resuming mid-session, reload ballot data ──
  useEffect(() => {
    if (
      ballotHydrated &&
      currentPhase !== 'state-select' &&
      currentPhase !== 'demographics' &&
      ballotItems.length === 0 &&
      !isLoading
    ) {
      const ballotId = demographicProfile.selectedBallotId;
      if (ballotId) {
        loadBallotById(ballotId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballotHydrated, currentPhase]);

  // ── Restore current vote when index changes ──
  useEffect(() => {
    if (ballotItems.length === 0 || !ballotHydrated) return;
    const saved = getVoteForItem(ballotItems[currentIndex]?.id);
    if (saved) {
      setCurrentVote(saved.choice);
      setWriteInName(saved.writeInName || '');
    } else {
      setCurrentVote(null);
      setWriteInName('');
    }
  }, [ballotItems, ballotHydrated, currentIndex, getVoteForItem]);

  // ── Feedback screen label ──
  useEffect(() => {
    setScreenLabel(`Wizard - ${currentPhase}`);
  }, [currentPhase, setScreenLabel]);

  // ═══════════════════════════════════════════════════════════
  // Ballot loading
  // ═══════════════════════════════════════════════════════════

  const loadBallotById = useCallback(
    async (ballotId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ballotApi.getById(ballotId);
        setBallot(data);
        const { categories: cats, items } = transformBallot(data);
        setBallotItems(items);
        setCategories(cats);
        setRelevantAxes(collectRelevantAxes(items));
        setBallotSource('static_selected');
      } catch (err) {
        setError('Failed to load ballot data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ═══════════════════════════════════════════════════════════
  // Phase handlers
  // ═══════════════════════════════════════════════════════════

  /** State selection complete → load ballot + go to demographics */
  const handleStateSelected = useCallback(
    async (stateCode: string, ballotId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ballotApi.getById(ballotId);
        setBallot(data);
        const { categories: cats, items } = transformBallot(data);
        setBallotItems(items);
        setCategories(cats);

        const axes = collectRelevantAxes(items);
        setRelevantAxes(axes);

        // Persist to demographic store
        demoSetField('selectedState', stateCode as DemoState);
        demoSetField('selectedBallotId', ballotId);

        // Sync to conversation store for AI assistant
        const itemIds = items.map((item) => item.id);
        convSelectState(ballotId, itemIds, axes);

        markPhaseCompleted('state-select');
        setPhase('demographics');
      } catch (err) {
        setError('Failed to load ballot data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [demoSetField, convSelectState, markPhaseCompleted, setPhase]
  );

  /** Demographics complete → go to assessment */
  const handleDemographicsComplete = useCallback(() => {
    demoSubmitProfile();
    convCompleteDemographics();
    markPhaseCompleted('demographics');
    setPhase('assessment');
  }, [demoSubmitProfile, convCompleteDemographics, markPhaseCompleted, setPhase]);

  const handleDemographicsSkip = useCallback(() => {
    demoSkipProfile();
    convSkipDemographics();
    markPhaseCompleted('demographics');
    setPhase('assessment');
  }, [demoSkipProfile, convSkipDemographics, markPhaseCompleted, setPhase]);

  /** Hybrid assessment complete → bridge to profile, go to profile-review */
  const handleAssessmentComplete = useCallback(
    (hybridProfile: Record<string, UserValueRecord>) => {
      // Bridge to conversation store
      const converted: Record<string, ProgressiveAxisValue> = {};
      for (const [axisId, record] of Object.entries(hybridProfile)) {
        converted[axisId] = {
          value: record.score,
          confidence: record.confidence,
          importance: 5,
          signalCount: record.isImputed ? 0 : 1,
        };
      }
      updateConvProfile(converted);

      // Bridge to userStore (sets blueprintProfile)
      applyHybridProfile(hybridProfile);
      completeAssessment();
      convFinishWarmup();

      markPhaseCompleted('assessment');
      setPhase('profile-review');
    },
    [updateConvProfile, applyHybridProfile, completeAssessment, convFinishWarmup, markPhaseCompleted, setPhase]
  );

  /** Profile review → proceed to ballot items */
  const handleProfileReviewNext = useCallback(() => {
    markPhaseCompleted('profile-review');
    setPhase('ballot-item');
  }, [markPhaseCompleted, setPhase]);

  // ── Fine-tuning (within profile-review phase) ──

  const handleFineTune = useCallback((axisId: string) => {
    setFineTuningAxisId(axisId);
  }, []);

  const handleFineTuningComplete = useCallback(
    (responses: Record<string, number>) => {
      if (fineTuningAxisId) {
        setFineTuningResponses((prev) => ({
          ...prev,
          [fineTuningAxisId]: responses,
        }));
        const score = calculateFineTunedScore(fineTuningAxisId, responses);
        if (score !== null) {
          const newValue = Math.round((score + 1) * 5);
          updateAxisValue(fineTuningAxisId, newValue);
        }
      }
      setFineTuningAxisId(null);
    },
    [fineTuningAxisId, updateAxisValue]
  );

  const handleFineTuningCancel = useCallback(() => {
    setFineTuningAxisId(null);
  }, []);

  const handleChangeAxis = useCallback(
    (axisId: string, value: number) => {
      updateAxisValue(axisId, value);
    },
    [updateAxisValue]
  );

  const handleChangeAxisImportance = useCallback(
    (axisId: string, value: number) => {
      updateAxisImportance(axisId, value);
    },
    [updateAxisImportance]
  );

  const handleRetakeAssessment = useCallback(() => {
    setPhase('assessment');
  }, [setPhase]);

  // ═══════════════════════════════════════════════════════════
  // Ballot-item phase handlers
  // ═══════════════════════════════════════════════════════════

  const propositionRec = useMemo(() => {
    if (!currentItem || currentItem.type !== 'proposition' || valueAxes.length === 0) {
      return { vote: null, confidence: 0, explanation: '', factors: [], breakdown: [] };
    }
    return computePropositionRecommendation(currentItem, valueAxes);
  }, [currentItem, valueAxes]);

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

  const personalImpacts = useMemo(() => {
    if (!currentItem || demographicsWasSkipped) return [];
    return computeDemographicInsights(currentItem.id, demographicProfile);
  }, [currentItem, demographicProfile, demographicsWasSkipped]);

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

  const handleNext = useCallback(() => {
    saveCurrentVote();
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
    } else {
      // All items done → go to summary
      markPhaseCompleted('ballot-item');
      markPhaseCompleted('summary');
      setPhase('summary');
    }
    setAiDrawerOpen(false);
  }, [
    currentIndex, saveCurrentVote, restoreVote, ballotItems,
    setCurrentIndex, markPhaseCompleted, setPhase,
  ]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      restoreVote(ballotItems[prevIndex].id);
      setAiDrawerOpen(false);
    }
  }, [currentIndex, restoreVote, ballotItems, setCurrentIndex]);

  const handleSkip = useCallback(() => {
    if (currentIndex < ballotItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      restoreVote(ballotItems[nextIndex].id);
      setCurrentVote(null);
      setWriteInName('');
      setAiDrawerOpen(false);
    }
  }, [currentIndex, restoreVote, ballotItems, setCurrentIndex]);

  const handleJumpTo = useCallback(
    (itemIndex: number) => {
      if (currentVote) saveCurrentVote();
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setAiDrawerOpen(false);
    },
    [currentVote, saveCurrentVote, restoreVote, ballotItems, setCurrentIndex]
  );

  const handleEditItem = useCallback(
    (itemIndex: number) => {
      setCurrentIndex(itemIndex);
      restoreVote(ballotItems[itemIndex].id);
      setPhase('ballot-item');
    },
    [restoreVote, ballotItems, setCurrentIndex, setPhase]
  );

  const handleValueChange = useCallback((axisId: string, value: number) => {
    useUserStore.getState().updateAxisValue(axisId, value);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Two-tier reset handlers ──
  const handleRedoVotes = useCallback(() => {
    redoVotes();
    setCurrentVote(null);
    setWriteInName('');
    setShowRedoConfirm(false);
  }, [redoVotes]);

  const handleStartFresh = useCallback(() => {
    startFresh();
    useDemographicStore.getState().reset();
    useUserStore.getState().resetUserData();
    useConversationStore.getState().resetSession();
    setBallotItems([]);
    setCategories([]);
    setRelevantAxes([]);
    setBallot(null);
    setCurrentVote(null);
    setWriteInName('');
    setShowFreshConfirm(false);
  }, [startFresh]);

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  // Global loading
  if (!userHydrated || !ballotHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  // ── Phase: State selection ──
  if (currentPhase === 'state-select') {
    return (
      <div className="flex flex-col h-full">
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

  // ── Phase: Demographics ──
  if (currentPhase === 'demographics') {
    return (
      <div className="flex flex-col h-full">
        <DemographicGate
          relevantAxes={relevantAxes}
          onComplete={handleDemographicsComplete}
          onSkip={handleDemographicsSkip}
        />
      </div>
    );
  }

  // ── Phase: Assessment (hybrid structured + NLP) ──
  if (currentPhase === 'assessment') {
    // Resume prompt — show if there's a saved session with answers
    const hasSavedSession = savedHybridSession && savedHybridSession.answeredAxes.length > 0;
    if (hasSavedSession && resumeDecision === 'pending') {
      const answered = savedHybridSession.answeredAxes.length;
      const domainMap: Record<string, string> = {
        econ: 'Economy', health: 'Healthcare', housing: 'Housing',
        justice: 'Justice', climate: 'Climate',
      };
      const coveredDomains = new Set(
        savedHybridSession.answeredAxes.map((id: string) => id.split('_')[0])
      );

      return (
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <span className="text-3xl mb-3 block">👋</span>
              <h2 className="text-lg font-bold text-gray-900">Welcome back!</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                You answered {answered} question{answered !== 1 ? 's' : ''} last time.
                Pick up where you left off, or start fresh.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border-default p-4 space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Your progress</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: 17 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${i < answered ? 'bg-brand-primary' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-500 shrink-0">{answered}/17</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Object.entries(domainMap).map(([key, name]) => (
                  <span
                    key={key}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      coveredDomains.has(key)
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setResumeDecision('resume')}
                className="w-full py-3.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
              >
                Continue where I left off
              </button>
              {answered >= 5 && (
                <button
                  onClick={() => {
                    handleAssessmentComplete(getFullProfile(savedHybridSession));
                    clearHybridSession();
                  }}
                  className="w-full py-3 rounded-xl border border-border-default bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  See results with what I have
                </button>
              )}
              <button
                onClick={() => { clearHybridSession(); setResumeDecision('fresh'); }}
                className="w-full py-2 text-[12px] text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                Start over from scratch
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <HybridAssessmentView
          resumeSession={resumeDecision === 'resume' ? savedHybridSession : undefined}
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  // ── Phase: Profile Review ──
  if (currentPhase === 'profile-review') {
    // Fine-tuning sub-screen
    if (fineTuningAxisId && blueprintSpec) {
      // Derive the parent position title from the user's current axis value
      const parentSliderConfig = getSliderConfig(fineTuningAxisId);
      let parentPositionTitle: string | undefined;
      if (parentSliderConfig && blueprintProfile) {
        const axisProfile = blueprintProfile.domains
          .flatMap((d) => d.axes)
          .find((a) => a.axis_id === fineTuningAxisId);
        if (axisProfile) {
          const posCount = parentSliderConfig.positions.length;
          const posIndex = Math.round((axisProfile.value_0_10 / 10) * (posCount - 1));
          parentPositionTitle = parentSliderConfig.positions[Math.max(0, Math.min(posCount - 1, posIndex))]?.title;
        }
      }

      return (
        <HybridFineTuningView
          axisId={fineTuningAxisId}
          spec={blueprintSpec}
          existingResponses={fineTuningResponses[fineTuningAxisId] || {}}
          parentPositionTitle={parentPositionTitle}
          onComplete={handleFineTuningComplete}
          onCancel={handleFineTuningCancel}
        />
      );
    }

    if (!blueprintProfile || !blueprintSpec) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      );
    }

    return (
      <ProfileReviewPhase
        profile={blueprintProfile}
        spec={blueprintSpec}
        metaDimensions={metaDimensions}
        fineTuningResponses={fineTuningResponses}
        onRetake={handleRetakeAssessment}
        onFineTune={handleFineTune}
        onChangeAxis={handleChangeAxis}
        onChangeAxisImportance={handleChangeAxisImportance}
        onNext={handleProfileReviewNext}
        daysRemaining={daysRemaining}
        electionLabel={electionLabel}
        voterInfo={voterInfo}
        location={location}
      />
    );
  }

  // ── Phase: Ballot items ──
  if (currentPhase === 'ballot-item') {
    // Loading ballot
    if (isLoading || ballotItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading your ballot...</p>
        </div>
      );
    }

    // Needs assessment
    if (!hasCompletedAssessment || valueAxes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Complete Your Assessment First</h2>
          <p className="text-center text-gray-600 max-w-sm">
            To get personalized voting recommendations, complete the values assessment.
          </p>
          <button
            onClick={() => setPhase('assessment')}
            className="mt-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Go to Assessment
          </button>
        </div>
      );
    }

    // Intro screen (first time)
    if (!hasSeenIntro) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center bg-gray-50 px-6">
          <div className="w-full max-w-sm">
            <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
              Your Personalized Ballot
            </h1>
            <p className="mb-6 text-center text-sm text-gray-500">
              Here&apos;s what to expect as you work through each race and measure on your ballot.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Match scores</p>
                  <p className="text-[13px] leading-snug text-gray-500">
                    See suggested candidates ranked by how closely they align with your values — but the final vote is always yours.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Recommendations</p>
                  <p className="text-[13px] leading-snug text-gray-500">
                    For ballot measures, you&apos;ll see a suggested vote tied to your values.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Hand className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">It&apos;s your call</p>
                  <p className="text-[13px] leading-snug text-gray-500">
                    Pick a candidate or vote YES/NO, or skip any item.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Adjust anytime</p>
                  <p className="text-[13px] leading-snug text-gray-500">
                    Adjust your values on any item to see how recommendations shift.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={dismissIntro}
              className="mt-8 w-full rounded-xl bg-brand-primary py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </button>
          </div>
        </div>
      );
    }

    if (!currentItem) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        </div>
      );
    }

    // Main ballot item view
    return (
      <div className="flex flex-col h-full overflow-hidden -mx-4 bg-gray-50">
        <BallotNavigator
          ballotItems={ballotItems}
          savedVotes={savedVotes}
          currentIndex={currentIndex}
          onJumpTo={handleJumpTo}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-4">
          <DemoBanner />
          <BallotItemHeader item={currentItem} />

          {currentItem.type === 'proposition' && (
            <RecommendationBanner
              recommendation={propositionRec}
              valueFraming={propositionValueFraming}
            />
          )}

          <PersonalImpactSection impacts={personalImpacts} />

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

          <ValuesSection
            axes={valueAxes}
            relevantAxisIds={currentItem.relevantAxes || []}
            onValueChange={handleValueChange}
            expanded={valuesExpanded}
            onToggle={() => setValuesExpanded((v) => !v)}
          />

          <DemographicSection
            expanded={demographicExpanded}
            onToggle={() => setDemographicExpanded((v) => !v)}
          />
        </div>

        {/* Sticky navigation + AI button */}
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

        {/* AI Assistant Drawer */}
        <AiAssistantDrawer
          isOpen={aiDrawerOpen}
          onToggle={() => setAiDrawerOpen((v) => !v)}
          ballotItem={currentItem}
          axisDefinitions={blueprintSpec?.axes ?? []}
          focusedCandidateId={currentItem.type === 'candidate_race' ? currentVote : undefined}
        />
      </div>
    );
  }

  // ── Phase: Summary ──
  if (currentPhase === 'summary') {
    return (
      <div>
        <BallotSummary
          votes={savedVotes}
          ballotItems={ballotItems}
          categories={categories}
          onEditItem={handleEditItem}
          onStartOver={() => setShowRedoConfirm(true)}
          onPrint={handlePrint}
          voterInfo={voterInfo}
          location={location}
          sessionMinutes={useBallotStore.getState().getSessionDurationMinutes()}
          archetypeName={blueprintProfile ? getArchetypeDisplayName(computeArchetype(blueprintProfile).primary, getArchetypeVariant()) : undefined}
          archetypeEmoji={blueprintProfile ? getArchetypeDisplayEmoji(computeArchetype(blueprintProfile).primary, getArchetypeVariant()) : undefined}
        />

        {/* Try again CTA — encourage testers to explore different positions */}
        <div className="mx-4 mb-8 rounded-2xl border border-border-default bg-white px-5 py-5 text-center">
          <p className="text-[15px] font-bold text-gray-900 mb-1">
            Try it with different views
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
            Curious how the results change? Go through the assessment again with
            different policy positions or demographics and see how your matches shift.
          </p>
          <button
            onClick={() => setShowFreshConfirm(true)}
            className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 transition-colors text-white text-sm font-semibold"
          >
            Start a new session
          </button>
        </div>

        {/* Redo confirmation dialog (triggered by Start Over in review section) */}
        {showRedoConfirm && (
          <ConfirmDialog
            title="Redo your votes?"
            message="This will clear all your saved votes and return you to the first ballot item. Your values profile and demographics will be kept."
            confirmLabel="Redo votes"
            confirmStyle="primary"
            onConfirm={handleRedoVotes}
            onCancel={() => setShowRedoConfirm(false)}
          />
        )}

        {/* Start fresh confirmation dialog */}
        {showFreshConfirm && (
          <ConfirmDialog
            title="Start a new session?"
            message="This will clear your votes, values assessment, and demographics so you can go through the whole experience again with different positions."
            confirmLabel="Let's go"
            confirmStyle="primary"
            onConfirm={handleStartFresh}
            onCancel={() => setShowFreshConfirm(false)}
          />
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="mt-3 text-gray-600">Something went wrong. Please refresh.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

/** Profile Review phase — wraps BlueprintSummaryView with a "Next" CTA instead of router push */
function ProfileReviewPhase({
  profile,
  spec,
  metaDimensions,
  fineTuningResponses,
  onRetake,
  onFineTune,
  onChangeAxis,
  onChangeAxisImportance,
  onNext,
  daysRemaining,
  electionLabel,
  voterInfo,
  location,
}: {
  profile: BlueprintProfile;
  spec: Spec;
  metaDimensions: ReturnType<typeof deriveMetaDimensions> | null;
  fineTuningResponses: Record<string, Record<string, number>>;
  onRetake: () => void;
  onFineTune: (axisId: string) => void;
  onChangeAxis: (axisId: string, value: number) => void;
  onChangeAxisImportance: (axisId: string, value: number) => void;
  onNext: () => void;
  daysRemaining: number;
  electionLabel: string;
  voterInfo: unknown;
  location: unknown;
}) {
  return (
    <div className="relative">
      <BlueprintSummaryView
        profile={profile}
        spec={spec}
        metaDimensions={metaDimensions}
        fineTuningResponses={fineTuningResponses}
        onRetake={onRetake}
        onFineTune={onFineTune}
        onChangeAxis={onChangeAxis}
        onChangeAxisImportance={onChangeAxisImportance}
        hideCta
      />
      {/* Override the floating CTA with wizard advance */}
      <div className="fixed bottom-6 left-0 right-0 z-50 mx-auto max-w-lg px-4">
        <button
          onClick={onNext}
          className="w-full rounded-[14px] bg-brand-primary py-4 text-[15px] font-bold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          Build my ballot &rarr;
        </button>
      </div>
    </div>
  );
}

/** Confirmation dialog for destructive actions */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={[
              'flex-1 rounded-xl py-3 text-sm font-semibold transition-colors',
              confirmStyle === 'destructive'
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-brand-primary text-white hover:bg-brand-primary/90',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
