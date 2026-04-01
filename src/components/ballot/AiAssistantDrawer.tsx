'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ChevronDown } from 'lucide-react';
import type { BallotItem } from '@/lib/ballotHelpers';
import ConversationView from '@/components/conversation/ConversationView';
import { useBallotStore } from '@/stores/ballotStore';
import { useConversationStore } from '@/stores/conversationStore';

interface AxisDef {
  id: string;
  name: string;
  description: string;
  poleA: { label: string };
  poleB: { label: string };
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  ballotItem: BallotItem;
  axisDefinitions: AxisDef[];
  /** Which candidate the user was viewing when they opened the drawer */
  focusedCandidateId?: string | null;
}

/** Number of times to show the expanded hint before suppressing */
const EXPAND_SHOW_LIMIT = 3;
const EXPAND_DURATION_MS = 4000;

function getContextualHint(item: BallotItem): string {
  if (item.type === 'proposition') {
    return 'Break down this measure in plain language';
  }
  return 'Compare these candidates to your values';
}

export default function AiAssistantDrawer({
  isOpen,
  onToggle,
  ballotItem,
  axisDefinitions,
  focusedCandidateId,
}: AiAssistantDrawerProps) {
  const saveVote = useBallotStore((s) => s.saveVote);
  const recordVote = useConversationStore((s) => s.recordVote);
  const advanceToNext = useConversationStore((s) => s.advanceToNext);

  const [expanded, setExpanded] = useState(false);
  const expandCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expand with contextual hint when ballot item changes
  useEffect(() => {
    if (isOpen) return;
    if (expandCountRef.current >= EXPAND_SHOW_LIMIT) return;

    expandCountRef.current += 1;
    // Defer setState to avoid synchronous call in effect body
    const expandTimer = setTimeout(() => setExpanded(true), 0);
    timerRef.current = setTimeout(() => setExpanded(false), EXPAND_DURATION_MS);
    return () => {
      clearTimeout(expandTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ballotItem.id, isOpen]);

  const handleVoteConfirmed = (itemId: string, choice: string | null) => {
    recordVote(itemId, choice);
    saveVote({
      itemId,
      choice,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSkip = (itemId: string) => {
    recordVote(itemId, null);
  };

  const hint = getContextualHint(ballotItem);

  return (
    <>
      {/* Floating "Ask AI" button — expands with contextual hint on item change */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={[
            'fixed bottom-[88px] right-3 z-50 flex items-center gap-2.5 bg-brand-primary text-white shadow-lg',
            'transition-all duration-400 ease-out hover:bg-brand-primary/90 active:scale-95',
            expanded ? 'rounded-2xl px-4 py-3 max-w-[280px]' : 'rounded-full px-4 py-3 max-w-[120px]',
          ].join(' ')}
          aria-label="Ask AI about this ballot item"
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1 min-w-0 overflow-hidden text-left">
            <span className="text-sm font-semibold whitespace-nowrap">Ask AI</span>
            <span
              className={[
                'block text-xs text-white/80 leading-snug transition-all duration-300 overflow-hidden',
                expanded ? 'max-h-10 opacity-100 mt-0.5' : 'max-h-0 opacity-0',
              ].join(' ')}
            >
              {hint}
            </span>
          </span>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/30 transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Slide-up drawer */}
      <div
        className={[
          'fixed bottom-0 left-0 right-0 z-[80] mx-auto max-w-lg',
          'rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ height: '70vh' }}
      >
        {/* Drawer handle / header */}
        <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-brand-primary" />
            <span className="text-sm font-semibold text-gray-800">AI Assistant</span>
          </div>
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close AI assistant"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Conversation content */}
        <div className="h-[calc(100%-48px)] overflow-hidden">
          {isOpen && (
            <ConversationView
              key={ballotItem.id}
              ballotItem={ballotItem}
              axisDefinitions={axisDefinitions}
              onVoteConfirmed={handleVoteConfirmed}
              onSkip={handleSkip}
              mode="drawer"
              focusedCandidateId={focusedCandidateId}
            />
          )}
        </div>
      </div>
    </>
  );
}
