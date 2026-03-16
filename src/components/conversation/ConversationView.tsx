'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, SkipForward, Check, MessageCircle, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { BallotItem, PropositionRecommendation, CandidateMatch, ValueAxis } from '@/lib/ballotHelpers';
import { computePropositionRecommendation, computeCandidateMatches } from '@/lib/ballotHelpers';
import type { ConversationMessage, ConversationTurnResponse } from '@/types/conversation';
import { useConversationStore } from '@/stores/conversationStore';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import ChatBubble from './ChatBubble';
import VoiceButton from './VoiceButton';
import CandidateCard from '@/components/ballot/CandidateCard';
import CandidateComparisonSheet from '@/components/ballot/CandidateComparisonSheet';

interface AxisDef {
  id: string;
  name: string;
  description: string;
  poleA: { label: string };
  poleB: { label: string };
}

interface ConversationViewProps {
  ballotItem: BallotItem;
  axisDefinitions: AxisDef[];
  onVoteConfirmed: (itemId: string, choice: string | null) => void;
  onSkip: (itemId: string) => void;
  /** 'drawer' = opened from Ask AI button (user already sees the ballot item);
   *  'standalone' = primary conversation flow (AI guides through items) */
  mode?: 'drawer' | 'standalone';
}

/**
 * Convert the progressive profile from conversation store into ValueAxis[]
 * for the recommendation engine.
 */
function profileToValueAxes(
  profile: Record<string, { value: number; confidence: number; importance: number; signalCount: number }>,
  axisDefinitions: Array<{ id: string; name: string; description: string; poleA: { label: string }; poleB: { label: string } }>
): ValueAxis[] {
  return axisDefinitions.map((axisDef) => {
    const profileValue = profile[axisDef.id];
    return {
      id: axisDef.id,
      name: axisDef.name,
      description: axisDef.description,
      value: profileValue?.value ?? 5,
      poleA: axisDef.poleA.label,
      poleB: axisDef.poleB.label,
      weight: profileValue ? (profileValue.importance ?? 5) / 5 : 1,
    };
  });
}

/**
 * Build an opening line for standalone mode (AI guides through items sequentially).
 */
function buildStandaloneOpener(item: BallotItem, rec: PropositionRecommendation | CandidateMatch[] | null): string {
  if (item.type === 'proposition') {
    const propRec = rec as PropositionRecommendation | null;
    let opener = `Next up is a ballot measure: **${item.title}**.\n\n${item.questionText}`;
    if (propRec?.vote) {
      const voteLabel = propRec.vote === 'yes' ? 'YES' : 'NO';
      const confidence = propRec.confidence >= 0.7 ? 'strongly' : propRec.confidence >= 0.4 ? 'slightly' : 'very slightly';
      opener += `\n\nBased on what you've told me, your values ${confidence} lean toward voting **${voteLabel}** on this one. You can confirm below, or ask me to explain why.`;
    } else {
      opener += `\n\nThis one's a close call based on your values — take a look at both sides below, or ask me to break it down.`;
    }
    return opener;
  }

  if (rec && Array.isArray(rec) && rec.length > 0) {
    return `Next up: **${item.title}**. Here's how the candidates align with your values.`;
  }

  return `Next up: **${item.title}**.`;
}

/**
 * Build an opening line for drawer mode (user tapped "Ask AI" on an item they're already viewing).
 * Skips restating what they can already see; leads with a useful insight or an invitation.
 */
function buildDrawerOpener(item: BallotItem, rec: PropositionRecommendation | CandidateMatch[] | null): string {
  if (item.type === 'proposition') {
    const propRec = rec as PropositionRecommendation | null;
    if (propRec?.vote) {
      const voteLabel = propRec.vote === 'yes' ? 'YES' : 'NO';
      if (propRec.confidence >= 0.7) {
        return `Your civic blueprint points pretty clearly toward **${voteLabel}** here. Want me to walk you through the reasoning?`;
      }
      if (propRec.confidence >= 0.4) {
        return `This leans **${voteLabel}** based on your values, though it's not clear-cut. I can break down the tradeoffs if you'd like.`;
      }
      return `This one could go either way based on your values. Want me to help you think through it?`;
    }
    return `I can help you think through this measure. Ask me anything — what it means in practice, how it connects to your values, or what the arguments on each side look like.`;
  }

  // Candidate race
  if (rec && Array.isArray(rec) && rec.length > 0) {
    const sorted = [...rec].sort((a, b) => b.matchPercent - a.matchPercent);
    const best = sorted[0];
    const bestName = item.candidates?.find((c) => c.id === best.candidateId)?.name || 'the top match';
    if (sorted.length >= 2) {
      const gap = best.matchPercent - sorted[1].matchPercent;
      if (gap < 5) {
        return `This is a close one — your top candidates are within a few points of each other. I can help you dig into where they differ.`;
      }
      return `**${bestName}** looks like your strongest match at ${best.matchPercent}%. Want to know why, or compare on a specific issue?`;
    }
    return `**${bestName}** is your closest match at ${best.matchPercent}%. I can explain the reasoning or answer questions about any candidate.`;
  }

  return `I can help you learn more about the candidates in this race. What would you like to know?`;
}

export default function ConversationView({
  ballotItem,
  axisDefinitions,
  onVoteConfirmed,
  onSkip,
  mode = 'standalone',
}: ConversationViewProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedPropositionVote, setSelectedPropositionVote] = useState<'yes' | 'no' | null>(null);
  const [comparingCandidate, setComparingCandidate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openerSentRef = useRef<string | null>(null);

  const session = useConversationStore((s) => s.session);
  const addMessage = useConversationStore((s) => s.addMessage);
  const applyValueSignals = useConversationStore((s) => s.applyValueSignals);
  const setItemRecommendation = useConversationStore((s) => s.setItemRecommendation);
  const setItemStatus = useConversationStore((s) => s.setItemStatus);
  const updateProfile = useConversationStore((s) => s.updateProfile);

  const voice = useVoiceInput();

  const itemConversation = session?.items[ballotItem.id];
  const messages = itemConversation?.messages || [];
  const recommendation = itemConversation?.recommendation;
  const itemStatus = itemConversation?.status || 'pending';

  // Compute recommendation immediately from the profile built during warmup
  const immediateRecommendation = useMemo(() => {
    if (!session?.profile || axisDefinitions.length === 0) return null;

    const userAxes = profileToValueAxes(session.profile, axisDefinitions);

    if (ballotItem.type === 'proposition') {
      const rec = computePropositionRecommendation(ballotItem, userAxes);
      return rec.confidence > 0 ? rec : null;
    } else {
      const matches = computeCandidateMatches(ballotItem, userAxes);
      return matches.length > 0 ? matches : null;
    }
  }, [session?.profile, ballotItem, axisDefinitions]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, recommendation]);

  // Auto-select best match candidate or recommended proposition vote
  useEffect(() => {
    if (!recommendation) return;
    if (Array.isArray(recommendation)) {
      const best = recommendation.find((m) => m.isBestMatch) || recommendation[0];
      if (best) setSelectedCandidateId(best.candidateId);
    } else {
      if (recommendation.vote) setSelectedPropositionVote(recommendation.vote);
    }
  }, [recommendation]);

  // When voice transcript arrives, use it as input
  useEffect(() => {
    if (voice.transcript) {
      handleSendMessage(voice.transcript);
      voice.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.transcript]);

  // Show intro message with recommendation when item first appears
  useEffect(() => {
    if (openerSentRef.current === ballotItem.id) return;
    if (messages.length > 0 || itemStatus !== 'pending') return;

    openerSentRef.current = ballotItem.id;

    const openerContent = mode === 'drawer'
      ? buildDrawerOpener(ballotItem, immediateRecommendation)
      : buildStandaloneOpener(ballotItem, immediateRecommendation);

    const introMessage: ConversationMessage = {
      id: `intro-${ballotItem.id}`,
      role: 'assistant',
      content: openerContent,
      timestamp: new Date().toISOString(),
      ballotItemId: ballotItem.id,
    };

    addMessage(ballotItem.id, introMessage);

    // If we have a recommendation, set it immediately
    if (immediateRecommendation) {
      setItemRecommendation(ballotItem.id, immediateRecommendation);
    } else {
      setItemStatus(ballotItem.id, 'discussing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballotItem.id]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !session) return;

    setError(null);
    setInputText('');

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      ballotItemId: ballotItem.id,
    };

    addMessage(ballotItem.id, userMessage);
    setIsLoading(true);

    try {
      const currentMessages = [...messages, userMessage];

      const response = await fetch('/api/conversation/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ballotItemId: ballotItem.id,
          userMessage: text.trim(),
          currentProfile: session.profile,
          conversationHistory: currentMessages,
          ballotItem: {
            id: ballotItem.id,
            type: ballotItem.type,
            title: ballotItem.title,
            questionText: ballotItem.questionText,
            explanation: ballotItem.explanation,
            relevantAxes: ballotItem.relevantAxes,
            yesAxisEffects: ballotItem.yesAxisEffects,
            candidates: ballotItem.candidates?.map((c) => ({
              id: c.id,
              name: c.name,
              party: c.party,
              profile: {
                stances: c.profile.stances,
                summary: c.profile.summary,
              },
            })),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data: ConversationTurnResponse = await response.json();

      addMessage(ballotItem.id, data.assistantMessage);

      if (data.valueSignals.length > 0) {
        applyValueSignals(data.valueSignals);
      }

      if (data.updatedProfile) {
        updateProfile(data.updatedProfile);
      }

      if (data.recommendation && data.status === 'recommended') {
        setItemRecommendation(ballotItem.id, data.recommendation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, session, messages, ballotItem, addMessage, applyValueSignals, setItemRecommendation, updateProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleVoiceToggle = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  const handleConfirmSelection = () => {
    if (ballotItem.type === 'candidate_race') {
      if (!selectedCandidateId) return;
      onVoteConfirmed(ballotItem.id, selectedCandidateId);
    } else {
      if (!selectedPropositionVote) return;
      onVoteConfirmed(ballotItem.id, selectedPropositionVote);
    }
  };

  /** "Tell me more" handler — sends an explanation request to the LLM.
   *  In drawer mode, skips the fake user bubble to keep the chat feeling natural. */
  const handleTellMeMore = useCallback(async () => {
    if (isLoading || !session) return;

    const explainPrompt = ballotItem.type === 'proposition'
      ? "Can you break down what this measure means and why it connects to my values?"
      : "Can you tell me more about the differences between these candidates?";

    // In standalone mode, show the canned question as a user bubble for conversational flow.
    // In drawer mode, skip it — the user tapped a button, not typed a message.
    if (mode === 'standalone') {
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: explainPrompt,
        timestamp: new Date().toISOString(),
        ballotItemId: ballotItem.id,
      };
      addMessage(ballotItem.id, userMessage);
    }

    setItemStatus(ballotItem.id, 'discussing');
    setIsLoading(true);

    try {
      const currentMessages = mode === 'standalone'
        ? [...messages, { id: `user-${Date.now()}`, role: 'user' as const, content: explainPrompt, timestamp: new Date().toISOString(), ballotItemId: ballotItem.id }]
        : messages;

      const response = await fetch('/api/conversation/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ballotItemId: ballotItem.id,
          userMessage: explainPrompt,
          currentProfile: session.profile,
          conversationHistory: currentMessages,
          ballotItem: {
            id: ballotItem.id,
            type: ballotItem.type,
            title: ballotItem.title,
            questionText: ballotItem.questionText,
            explanation: ballotItem.explanation,
            relevantAxes: ballotItem.relevantAxes,
            yesAxisEffects: ballotItem.yesAxisEffects,
            candidates: ballotItem.candidates?.map((c) => ({
              id: c.id,
              name: c.name,
              party: c.party,
              profile: {
                stances: c.profile.stances,
                summary: c.profile.summary,
              },
            })),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data: ConversationTurnResponse = await response.json();

      addMessage(ballotItem.id, data.assistantMessage);

      if (data.valueSignals.length > 0) {
        applyValueSignals(data.valueSignals);
      }

      if (data.updatedProfile) {
        updateProfile(data.updatedProfile);
      }

      if (data.recommendation && data.status === 'recommended') {
        setItemRecommendation(ballotItem.id, data.recommendation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, session, messages, ballotItem, mode, addMessage, setItemStatus, applyValueSignals, setItemRecommendation, updateProfile]);

  // Get confidence label for proposition recommendations
  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.7) return 'Strong match';
    if (confidence >= 0.4) return 'Slight lean';
    return 'Close call';
  };

  // Render candidate cards for a candidate race
  const renderCandidateCards = () => {
    if (!recommendation || !Array.isArray(recommendation)) return null;
    if (!ballotItem.candidates || ballotItem.candidates.length === 0) return null;

    const sortedMatches = [...recommendation].sort((a, b) => b.matchPercent - a.matchPercent);
    const comparingCandidateObj = comparingCandidate
      ? ballotItem.candidates.find((c) => c.id === comparingCandidate) ?? null
      : null;
    const comparingMatch = comparingCandidate
      ? recommendation.find((m) => m.candidateId === comparingCandidate)
      : undefined;

    return (
      <>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            Based on what you told me, here&apos;s how the candidates compare:
          </p>
          {sortedMatches.map((match) => {
            const candidate = ballotItem.candidates!.find((c) => c.id === match.candidateId);
            if (!candidate) return null;
            return (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidateId === candidate.id}
                match={match}
                onSelect={() => setSelectedCandidateId(candidate.id)}
                onCompare={() => setComparingCandidate(candidate.id)}
              />
            );
          })}
        </div>
        {renderActionButtons()}
        <CandidateComparisonSheet
          visible={comparingCandidate !== null}
          candidate={comparingCandidateObj}
          match={comparingMatch}
          onClose={() => setComparingCandidate(null)}
        />
      </>
    );
  };

  // Render YES/NO option cards for a proposition
  const renderPropositionCards = () => {
    if (!recommendation || Array.isArray(recommendation)) return null;
    const rec = recommendation as PropositionRecommendation;

    const yesIsRecommended = rec.vote === 'yes';
    const noIsRecommended = rec.vote === 'no';
    const confidenceLabel = getConfidenceLabel(rec.confidence);

    // Separate breakdown factors by alignment
    const yesFactors = rec.breakdown
      .filter((b) => b.alignment === 'yes')
      .map((b) => b.axisName);
    const noFactors = rec.breakdown
      .filter((b) => b.alignment === 'no')
      .map((b) => b.axisName);

    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
          {confidenceLabel}
        </p>

        {/* YES card */}
        <button
          onClick={() => setSelectedPropositionVote('yes')}
          className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
            selectedPropositionVote === 'yes'
              ? 'border-brand-primary bg-brand-primary/[0.03]'
              : yesIsRecommended
                ? 'border-green-300 bg-green-50/50'
                : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {/* Radio */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                selectedPropositionVote === 'yes' ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
              }`}
            >
              {selectedPropositionVote === 'yes' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-[15px] font-bold text-gray-900">Vote YES</span>
                {yesIsRecommended && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-[11px] font-semibold text-green-700">
                    Recommended
                  </span>
                )}
              </div>
              {yesFactors.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Aligns with your values on {yesFactors.join(', ')}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* NO card */}
        <button
          onClick={() => setSelectedPropositionVote('no')}
          className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
            selectedPropositionVote === 'no'
              ? 'border-brand-primary bg-brand-primary/[0.03]'
              : noIsRecommended
                ? 'border-red-300 bg-red-50/50'
                : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {/* Radio */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                selectedPropositionVote === 'no' ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
              }`}
            >
              {selectedPropositionVote === 'no' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-[15px] font-bold text-gray-900">Vote NO</span>
                {noIsRecommended && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-[11px] font-semibold text-red-700">
                    Recommended
                  </span>
                )}
              </div>
              {noFactors.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Aligns with your values on {noFactors.join(', ')}
                </p>
              )}
            </div>
          </div>
        </button>

        {rec.explanation && (
          <p className="text-xs text-gray-500 px-1">{rec.explanation}</p>
        )}

        {renderActionButtons()}
      </div>
    );
  };

  // Render recommendation inline in the chat flow (standalone mode only)
  const renderRecommendation = () => {
    if (mode === 'drawer') return null;
    if (!recommendation || itemStatus !== 'recommended') return null;

    if (Array.isArray(recommendation)) {
      return renderCandidateCards();
    }
    return renderPropositionCards();
  };

  const hasSelection = ballotItem.type === 'candidate_race'
    ? selectedCandidateId !== null
    : selectedPropositionVote !== null;

  const renderActionButtons = () => (
    <div className="flex gap-2 pl-1">
      <button
        onClick={handleConfirmSelection}
        disabled={!hasSelection}
        className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check className="h-3.5 w-3.5" />
        Confirm
      </button>
      <button
        onClick={handleTellMeMore}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Tell me more
      </button>
      <button
        onClick={() => onSkip(ballotItem.id)}
        className="flex items-center gap-1.5 px-3 py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
      >
        Skip
      </button>
    </div>
  );

  // Category label — generic type, NOT the title (title is in the opener message)
  const categoryLabel = ballotItem.type === 'proposition' ? 'Ballot Measure' : 'Elected Office';

  return (
    <div className="flex flex-col h-full">
      {/* Minimal context chip — just the category, tappable for details */}
      <div className="px-4 pt-2 pb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-wide">
          {categoryLabel}
        </span>
        {ballotItem.explanation && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
          >
            Details
            <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Expandable details — only shown on tap */}
      {showDetails && (
        <div className="mx-4 mb-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
          {ballotItem.explanation}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {renderRecommendation()}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area — voice-first layout */}
      {itemStatus !== 'voted' && itemStatus !== 'skipped' && (
        <div className="border-t border-gray-100 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  voice.isRecording
                    ? 'Listening...'
                    : mode === 'drawer'
                      ? 'Ask a question...'
                      : messages.length <= 1
                        ? 'Share your thoughts...'
                        : 'Reply...'
                }
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
                disabled={isLoading || voice.isRecording}
              />
              {inputText.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-brand-primary disabled:text-gray-300 transition-colors shrink-0"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mic button — prominent */}
            <VoiceButton
              isRecording={voice.isRecording}
              isTranscribing={voice.isTranscribing}
              audioLevel={voice.audioLevel}
              onPress={handleVoiceToggle}
              disabled={isLoading}
            />
          </form>

          {voice.error && (
            <p className="text-xs text-red-500 mt-1 px-2">{voice.error}</p>
          )}

          {/* Skip link — subtle */}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() => onSkip(ballotItem.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SkipForward className="h-3 w-3" />
              Skip this item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
