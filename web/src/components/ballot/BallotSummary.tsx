'use client';

import React from 'react';
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
} from 'lucide-react';
import type { BallotItem, Category, UserVote } from '@/lib/ballotHelpers';

interface BallotSummaryProps {
  votes: UserVote[];
  ballotItems: BallotItem[];
  categories: Category[];
  onEditItem: (index: number) => void;
  onStartOver: () => void;
  onPrint: () => void;
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
}: BallotSummaryProps) {
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
      return vote.choice === 'yes' ? 'text-green-500' : 'text-red-500';
    }
    return 'text-violet-600';
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
      {/* Header */}
      <div className="flex flex-col items-center py-6 px-4 bg-white border-b border-gray-200 gap-2">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h1 className="text-[22px] font-extrabold text-gray-900 text-center leading-7">
          Your Ballot is Ready!
        </h1>
        <p className="text-[15px] text-gray-500 text-center leading-[21px]">
          {votedCount} items voted
          {skippedCount > 0 ? ` \u00b7 ${skippedCount} skipped` : ' \u00b7 All items completed'}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
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
                        className="ml-3 w-10 h-10 rounded-full bg-violet-600/10 flex items-center justify-center hover:bg-violet-600/20 transition-colors"
                      >
                        <Pencil className="h-[18px] w-[18px] text-violet-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action buttons */}
        <div className="space-y-3 mt-2">
          <button
            onClick={onPrint}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[14px] bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <Printer className="h-[22px] w-[22px] text-white" />
            <span className="text-[17px] font-bold text-white">Print Ballot</span>
          </button>

          <button
            onClick={onStartOver}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-[18px] w-[18px] text-gray-600" />
            <span className="text-[15px] font-semibold text-gray-600">Start Over</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 bg-gray-100 p-3.5 rounded-xl mb-10">
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
