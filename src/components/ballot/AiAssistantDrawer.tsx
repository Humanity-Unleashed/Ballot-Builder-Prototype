'use client';

import React from 'react';
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
}

export default function AiAssistantDrawer({
  isOpen,
  onToggle,
  ballotItem,
  axisDefinitions,
}: AiAssistantDrawerProps) {
  const saveVote = useBallotStore((s) => s.saveVote);
  const recordVote = useConversationStore((s) => s.recordVote);
  const advanceToNext = useConversationStore((s) => s.advanceToNext);

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

  return (
    <>
      {/* Floating "Ask AI" button — only visible when drawer is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-white shadow-lg transition-all hover:bg-brand-primary/90 active:scale-95"
          aria-label="Ask AI about this ballot item"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">Ask AI</span>
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
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
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
            />
          )}
        </div>
      </div>
    </>
  );
}
