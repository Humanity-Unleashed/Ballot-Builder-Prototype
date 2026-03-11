'use client';

import React from 'react';
import { CheckCircle2, SkipForward, HelpCircle } from 'lucide-react';
import type { ConversationSession } from '@/types/conversation';
import type { BallotItem, CandidateMatch, PropositionRecommendation } from '@/lib/ballotHelpers';

interface ConversationSummaryProps {
  session: ConversationSession;
  ballotItems: BallotItem[];
}

export default function ConversationSummary({
  session,
  ballotItems,
}: ConversationSummaryProps) {
  const votedItems = session.itemOrder
    .map((id) => ({
      item: ballotItems.find((bi) => bi.id === id),
      conversation: session.items[id],
    }))
    .filter(({ item }) => item);

  const votedCount = votedItems.filter(({ conversation }) => conversation?.status === 'voted').length;
  const skippedCount = votedItems.filter(({ conversation }) => conversation?.status === 'skipped').length;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Ballot Complete!</h1>
        <p className="text-sm text-gray-500">
          You voted on {votedCount} item{votedCount !== 1 ? 's' : ''}{skippedCount > 0 ? ` and skipped ${skippedCount}` : ''}.
        </p>
      </div>

      {/* Vote summary list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Your Choices
        </h2>
        {votedItems.map(({ item, conversation }) => {
          if (!item || !conversation) return null;

          let choiceLabel: string;
          let icon: React.ReactNode;

          if (conversation.status === 'skipped') {
            choiceLabel = 'Skipped';
            icon = <SkipForward className="h-4 w-4 text-amber-500" />;
          } else if (conversation.status === 'voted' && conversation.userVote) {
            if (item.type === 'proposition') {
              choiceLabel = conversation.userVote === 'yes' ? 'YES' : 'NO';
            } else {
              const candidate = item.candidates?.find((c) => c.id === conversation.userVote);
              choiceLabel = candidate?.name || conversation.userVote;
            }
            icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
          } else {
            choiceLabel = 'No vote';
            icon = <HelpCircle className="h-4 w-4 text-gray-400" />;
          }

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-600 shrink-0">
                {choiceLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Profile summary */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Values Discovered
        </h2>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-sm text-gray-600">
            Through this conversation, we learned about your positions on{' '}
            {Object.keys(session.profile).length} civic axes.
            Visit the Blueprint tab to see your full profile.
          </p>
        </div>
      </div>
    </div>
  );
}
