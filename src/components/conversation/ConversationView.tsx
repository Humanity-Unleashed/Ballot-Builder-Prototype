'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, SkipForward, Check, MessageCircle, ChevronDown } from 'lucide-react';
import type { BallotItem, PropositionRecommendation, CandidateMatch, ValueAxis } from '@/lib/ballotHelpers';
import { computePropositionRecommendation, computeCandidateMatches } from '@/lib/ballotHelpers';
import type { ConversationMessage, ConversationTurnResponse } from '@/types/conversation';
import { useConversationStore } from '@/stores/conversationStore';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import ChatBubble from './ChatBubble';
import VoiceButton from './VoiceButton';

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
 * Build a short, natural opening line for a ballot item with a recommendation.
 */
function buildOpenerWithRecommendation(item: BallotItem, rec: PropositionRecommendation | CandidateMatch[] | null): string {
  if (item.type === 'proposition') {
    const propRec = rec as PropositionRecommendation | null;
    if (propRec?.vote) {
      return `${item.questionText}\n\nBased on what you've told me, I'd recommend voting **${propRec.vote.toUpperCase()}**.${propRec.explanation ? ` ${propRec.explanation}` : ''} Want to discuss it, or does that sound right?`;
    }
    return item.questionText;
  }

  // Candidate race
  const matches = rec as CandidateMatch[] | null;
  const bestMatch = matches?.find((m) => m.isBestMatch) || matches?.[0];
  const candidateNames = item.candidates?.map((c) => {
    const party = c.party ? ` (${c.party})` : '';
    return `${c.name}${party}`;
  });

  if (bestMatch && candidateNames?.length) {
    const candidate = item.candidates?.find((c) => c.id === bestMatch.candidateId);
    const agreementText = bestMatch.keyAgreements.length > 0
      ? ` You align on ${bestMatch.keyAgreements.join(' and ')}.`
      : '';
    return `Next up: **${item.title}**. The candidates are ${candidateNames.join(', ')}.\n\nBased on your values, **${candidate?.name || 'Unknown'}** is a **${bestMatch.matchPercent}% match**.${agreementText} Want to discuss, or accept?`;
  }

  if (candidateNames && candidateNames.length > 0) {
    return `Next up: ${item.title}. The candidates are ${candidateNames.join(', ')}. Based on what you've told me, here's how they align with your values.`;
  }
  return `Next up: ${item.title}.`;
}

export default function ConversationView({
  ballotItem,
  axisDefinitions,
  onVoteConfirmed,
  onSkip,
}: ConversationViewProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
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

    const introMessage: ConversationMessage = {
      id: `intro-${ballotItem.id}`,
      role: 'assistant',
      content: buildOpenerWithRecommendation(ballotItem, immediateRecommendation),
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

  const handleAcceptRecommendation = () => {
    if (!recommendation) return;

    let choice: string | null = null;
    if (Array.isArray(recommendation)) {
      const best = recommendation.find((m) => m.isBestMatch);
      choice = best?.candidateId || recommendation[0]?.candidateId || null;
    } else {
      choice = recommendation.vote;
    }

    onVoteConfirmed(ballotItem.id, choice);
  };

  // Render recommendation inline in the chat flow
  const renderRecommendation = () => {
    if (!recommendation || itemStatus !== 'recommended') return null;

    if (Array.isArray(recommendation)) {
      const bestMatch = recommendation.find((m) => m.isBestMatch) || recommendation[0];
      if (!bestMatch) return null;
      const candidate = ballotItem.candidates?.find((c) => c.id === bestMatch.candidateId);

      return (
        <div className="space-y-3">
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl rounded-bl-md p-4 max-w-[85%]">
            <p className="text-sm font-semibold text-brand-primary mb-1">
              Based on what you told me:
            </p>
            <p className="text-[15px] font-bold text-gray-900">
              {candidate?.name || 'Unknown'} — {bestMatch.matchPercent}% match
            </p>
            {bestMatch.keyAgreements.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                You align on {bestMatch.keyAgreements.join(' and ')}
              </p>
            )}
          </div>
          {renderActionButtons()}
        </div>
      );
    }

    // Proposition
    const rec = recommendation as PropositionRecommendation;
    const isYes = rec.vote === 'yes';

    return (
      <div className="space-y-3">
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl rounded-bl-md p-4 max-w-[85%]">
          <p className="text-sm font-semibold text-brand-primary mb-1">
            Based on what you told me:
          </p>
          {rec.vote ? (
            <p className={`text-[15px] font-bold ${isYes ? 'text-green-700' : 'text-red-700'}`}>
              Vote {rec.vote.toUpperCase()}
            </p>
          ) : (
            <p className="text-[15px] font-bold text-gray-600">
              This one could go either way for you
            </p>
          )}
          {rec.explanation && (
            <p className="text-xs text-gray-500 mt-1">{rec.explanation}</p>
          )}
        </div>
        {renderActionButtons()}
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="flex gap-2 pl-1">
      <button
        onClick={handleAcceptRecommendation}
        className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
      >
        <Check className="h-3.5 w-3.5" />
        Got it
      </button>
      <button
        onClick={() => setItemStatus(ballotItem.id, 'discussing')}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
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
        <div className="border-t border-gray-100 px-4 py-3 safe-area-bottom">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  voice.isRecording
                    ? 'Listening...'
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
