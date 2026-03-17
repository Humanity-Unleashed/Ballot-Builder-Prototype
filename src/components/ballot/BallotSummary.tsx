'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  User,
  MinusCircle,
  Pencil,
  Printer,
  RefreshCw,
  Info,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { BallotItem, Category, UserVote } from '@/lib/ballotHelpers';
import type { VoteAmericaStateRules } from '@/server/types/externalApis';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import Confetti from './Confetti';
import CelebrationHeader from './CelebrationHeader';
import NextStepsCard from './NextStepsCard';
import SquadInviteCard from './SquadInviteCard';
import ShareSection from './ShareSection';

interface VoterInfo {
  registrationUrl?: string;
  absenteeBallotUrl?: string;
  pollingPlaceUrl?: string;
  stateRules?: VoteAmericaStateRules;
}

interface LocationInfo {
  state: string;
  stateName: string;
  city?: string;
}

interface BallotSummaryProps {
  votes: UserVote[];
  ballotItems: BallotItem[];
  categories: Category[];
  onEditItem: (index: number) => void;
  onStartOver: () => void;
  onPrint: () => void;
  voterInfo?: VoterInfo | null;
  location?: LocationInfo | null;
}

// Map category icon strings to lucide components
const iconMap: Record<string, React.ElementType> = {
  'file-text': FileText,
  users: Users,
};

export default function BallotSummary({
  votes,
  ballotItems,
  categories,
  onEditItem,
  onStartOver,
  onPrint,
  voterInfo,
  location,
}: BallotSummaryProps) {
  const { track } = useAnalyticsContext();
  const [reviewOpen, setReviewOpen] = useState(true);
  const votedCount = votes.length;
  const skippedCount = ballotItems.length - votedCount;

  const getVoteDisplay = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'YES' : 'NO';
    }
    if (vote.choice === 'write_in') {
      return `Write-in: ${vote.writeInName}`;
    }
    const candidate = item.candidates?.find((c) => c.id === vote.choice);
    return candidate?.name || String(vote.choice);
  };

  const getVoteIcon = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? CheckCircle2 : XCircle;
    }
    return User;
  };

  const getVoteColor = (vote: UserVote, item: BallotItem) => {
    if (item.type === 'proposition') {
      return vote.choice === 'yes' ? 'text-success' : 'text-negative';
    }
    return 'text-brand-primary';
  };

  // Group items by category
  const groupedItems = categories
    .map((cat) => ({
      category: cat,
      items: ballotItems
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Confetti />

      {/* Celebration header with stats */}
      <CelebrationHeader ballotItems={ballotItems} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-0 pt-4 pb-6 space-y-5">
        {/* Vote review — prominent, open by default */}
        <div className="px-4">
          <button
            onClick={() => {
              setReviewOpen((prev) => !prev);
              track('click', { element: 'toggle_review', open: !reviewOpen });
            }}
            className="w-full flex items-center justify-between py-3 text-sm font-semibold text-text-secondary"
          >
            <span>
              Review your selections ({votedCount} voted{skippedCount > 0 ? `, ${skippedCount} skipped` : ''})
            </span>
            {reviewOpen ? (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            )}
          </button>

          {reviewOpen && (
            <div className="space-y-5 animate-fade-in-up">
              {groupedItems.map(({ category, items }) => {
                const CategoryIcon = iconMap[category.icon] || FileText;

                return (
                  <div key={category.id}>
                    {/* Category badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <CategoryIcon className="h-4 w-4" style={{ color: category.color }} />
                      <span className="text-sm font-semibold" style={{ color: category.color }}>
                        {category.name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {items.map(({ item, index }) => {
                        const vote = votes.find((v) => v.itemId === item.id);
                        const isSkipped = !vote;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center bg-white rounded-xl p-3.5 border border-gray-200"
                          >
                            <div className="flex-1 space-y-1.5">
                              <p className="text-[15px] font-semibold text-gray-900 leading-5">
                                {item.title}
                              </p>
                              {isSkipped ? (
                                <div className="flex items-center gap-1.5">
                                  <MinusCircle className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-400 italic">Skipped</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  {React.createElement(getVoteIcon(vote, item), {
                                    className: `h-[18px] w-[18px] ${getVoteColor(vote, item)}`,
                                  })}
                                  <span className={`text-sm font-bold ${getVoteColor(vote, item)}`}>
                                    {getVoteDisplay(vote, item)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Edit button */}
                            <button
                              onClick={() => onEditItem(index)}
                              className="ml-3 w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center hover:bg-brand-primary/20 transition-colors"
                            >
                              <Pencil className="h-[18px] w-[18px] text-brand-primary" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Demoted action links */}
              <div className="flex items-center justify-center gap-4 pt-2 pb-1">
                <button
                  onClick={() => {
                    track('click', { element: 'print_ballot', votedCount, skippedCount });
                    onPrint();
                  }}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print Ballot
                </button>
                <span className="text-text-muted">|</span>
                <button
                  onClick={() => {
                    track('click', { element: 'start_over' });
                    onStartOver();
                  }}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-primary transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next steps */}
        <NextStepsCard voterInfo={voterInfo} location={location} />

        {/* Voting Squad CTA */}
        <SquadInviteCard />

        {/* Share */}
        <ShareSection />

        {/* Disclaimer */}
        <div className="mx-4 flex items-start gap-2.5 bg-gray-100 p-3.5 rounded-xl mb-10">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="flex-1 text-[13px] text-gray-500 leading-[19px]">
            This is a preview of your selections. Take this to your polling place or use it as a
            reference when completing your official ballot.
          </p>
        </div>
      </div>
    </div>
  );
}
