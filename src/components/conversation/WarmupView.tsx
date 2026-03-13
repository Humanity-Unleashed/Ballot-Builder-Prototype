'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowRight } from 'lucide-react';
import type { ConversationMessage } from '@/types/conversation';
import { DOMAIN_ORDER, DOMAIN_LABELS } from '@/types/conversation';
import type { DomainId } from '@/types/conversation';
import type { BallotItem } from '@/lib/ballotHelpers';
import { useConversationStore } from '@/stores/conversationStore';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import ChatBubble from './ChatBubble';
import VoiceButton from './VoiceButton';

interface WarmupViewProps {
  onWarmupComplete: () => void;
  ballotItems: BallotItem[];
}

/** Build compact ballot context from full ballot items for the warmup API */
function buildBallotContext(items: BallotItem[]) {
  return items.map((item) => {
    if (item.type === 'proposition') {
      return {
        id: item.id,
        type: 'proposition' as const,
        title: item.title,
        summary: item.questionText || item.explanation,
        relevantAxes: item.relevantAxes ?? (item.yesAxisEffects ? Object.keys(item.yesAxisEffects) : []),
      };
    }
    return {
      id: item.id,
      type: 'candidate_race' as const,
      title: item.title,
      summary: item.questionText || item.explanation,
      relevantAxes: item.relevantAxes ?? [],
      candidates: item.candidates?.map((c) => c.name) ?? [],
    };
  });
}

export default function WarmupView({ onWarmupComplete, ballotItems }: WarmupViewProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openerSentForDomainRef = useRef<number>(-1);

  // Memoize ballot context so it doesn't rebuild every render
  const ballotContext = React.useMemo(() => buildBallotContext(ballotItems), [ballotItems]);

  const session = useConversationStore((s) => s.session);
  const addWarmupMessage = useConversationStore((s) => s.addWarmupMessage);
  const incrementWarmupTurn = useConversationStore((s) => s.incrementWarmupTurn);
  const applyValueSignals = useConversationStore((s) => s.applyValueSignals);
  const updateProfile = useConversationStore((s) => s.updateProfile);
  const advanceDomain = useConversationStore((s) => s.advanceDomain);
  const finishWarmup = useConversationStore((s) => s.finishWarmup);

  const voice = useVoiceInput();

  const messages = session?.warmupMessages || [];
  const turnCount = session?.warmupTurnCount || 0;
  const currentDomainIndex = session?.currentDomainIndex ?? 0;
  const domainTurnCount = session?.domainTurnCount ?? 0;
  const currentDomainId = DOMAIN_ORDER[currentDomainIndex];
  const currentDomainLabel = DOMAIN_LABELS[currentDomainId];

  const relevantDomains = session?.relevantDomains ?? [...DOMAIN_ORDER];
  const relevantAxes = session?.relevantAxes ?? [];
  const currentRelevantIdx = relevantDomains.indexOf(currentDomainId as DomainId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Fetch LLM-generated opener when entering a new domain
  // In React Strict Mode (dev), effects run twice. We use AbortController to
  // cancel the first run's fetch, and reset the ref on cleanup so the second
  // run can start a fresh fetch.
  useEffect(() => {
    if (openerSentForDomainRef.current >= currentDomainIndex) return;

    const prevRef = openerSentForDomainRef.current;
    openerSentForDomainRef.current = currentDomainIndex;
    const controller = new AbortController();

    async function fetchOpener() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/conversation/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: '',
            conversationHistory: messages,
            currentProfile: session?.profile ?? {},
            turnCount,
            currentDomainIndex,
            domainTurnCount: 0,
            relevantAxes,
            ballotContext,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get opener');
        }

        const data = await response.json();
        addWarmupMessage(data.assistantMessage);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to start conversation');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchOpener();

    return () => {
      controller.abort();
      // Reset ref so Strict Mode's second mount can re-fetch
      openerSentForDomainRef.current = prevRef;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDomainIndex]);

  // Handle voice transcript
  useEffect(() => {
    if (voice.transcript) {
      handleSend(voice.transcript);
      voice.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.transcript]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !session) return;

    setError(null);
    setInputText('');

    const userMessage: ConversationMessage = {
      id: `warmup-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    addWarmupMessage(userMessage);
    incrementWarmupTurn();
    setIsLoading(true);

    try {
      const response = await fetch('/api/conversation/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text.trim(),
          conversationHistory: [...messages, userMessage],
          currentProfile: session.profile,
          turnCount,
          currentDomainIndex,
          domainTurnCount,
          relevantAxes,
          ballotContext,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();

      addWarmupMessage(data.assistantMessage);

      if (data.valueSignals?.length > 0) {
        applyValueSignals(data.valueSignals);
      }

      if (data.updatedProfile) {
        updateProfile(data.updatedProfile);
      }

      if (data.readyForBallot) {
        // All relevant domains done — transition to ballot
        setTransitioning(true);
        setTimeout(() => {
          finishWarmup();
          onWarmupComplete();
        }, 1500);
      } else if (data.domainComplete) {
        // Current domain done — brief pause then advance
        setTransitioning(true);
        setTimeout(() => {
          advanceDomain();
          setTransitioning(false);
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, session, messages, turnCount, currentDomainIndex, domainTurnCount, relevantAxes, ballotContext, addWarmupMessage, incrementWarmupTurn, applyValueSignals, updateProfile, advanceDomain, finishWarmup, onWarmupComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  const handleVoiceToggle = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  const handleSkipWarmup = () => {
    finishWarmup();
    onWarmupComplete();
  };

  // Find the next relevant domain for the transition message
  const nextRelevantDomain = relevantDomains[currentRelevantIdx + 1];
  const nextDomainLabel = nextRelevantDomain ? DOMAIN_LABELS[nextRelevantDomain] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Domain progress indicator */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {currentDomainLabel}
          </span>
          <span className="text-xs text-gray-400">
            {currentRelevantIdx + 1} of {relevantDomains.length}
          </span>
        </div>
        {/* Progress dots — only show relevant domains */}
        <div className="flex gap-1.5">
          {relevantDomains.map((domainId, i) => (
            <div
              key={domainId}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentRelevantIdx
                  ? 'bg-brand-primary'
                  : i === currentRelevantIdx
                    ? 'bg-brand-primary/50'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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

        {transitioning && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-brand-primary font-medium animate-pulse">
              {!nextDomainLabel
                ? "Great — let's look at your ballot!"
                : `Moving on to ${nextDomainLabel}...`}
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={voice.isRecording ? 'Listening...' : 'Share your thoughts...'}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
              disabled={isLoading || voice.isRecording || transitioning}
            />
            {inputText.trim() && (
              <button
                type="submit"
                disabled={isLoading || transitioning}
                className="text-brand-primary disabled:text-gray-300 transition-colors shrink-0"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>

          <VoiceButton
            isRecording={voice.isRecording}
            isTranscribing={voice.isTranscribing}
            audioLevel={voice.audioLevel}
            onPress={handleVoiceToggle}
            disabled={isLoading || transitioning}
          />
        </form>

        {voice.error && (
          <p className="text-xs text-red-500 mt-1 px-2">{voice.error}</p>
        )}

        {/* Skip warmup */}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={handleSkipWarmup}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            Skip to ballot
          </button>
        </div>
      </div>
    </div>
  );
}
