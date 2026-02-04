'use client';

import React from 'react';
import type { BallotItem, UserVote } from '@/lib/ballotHelpers';

interface BallotNavigatorProps {
  ballotItems: BallotItem[];
  savedVotes: UserVote[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
}

/**
 * Slim progress indicator that shows ballot completion state.
 * Each ballot item is a small bar segment; clicking it jumps to that item.
 */
export default function BallotNavigator({
  ballotItems,
  savedVotes,
  currentIndex,
  onJumpTo,
}: BallotNavigatorProps) {
  const completedCount = savedVotes.length;

  const getItemStatus = (
    item: BallotItem,
    index: number
  ): 'completed' | 'current' | 'pending' => {
    if (index === currentIndex) return 'current';
    const vote = savedVotes.find((v) => v.itemId === item.id);
    return vote ? 'completed' : 'pending';
  };

  return (
    <div className="bg-gray-50 py-2.5 px-4 border-b border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-2 text-center">
        {currentIndex + 1} of {ballotItems.length} &middot; {completedCount} completed
      </p>

      <div className="flex gap-1.5 items-center">
        {ballotItems.map((item, index) => {
          const status = getItemStatus(item, index);

          const dotClass =
            status === 'current'
              ? 'bg-[#B4A0D9] h-[7px] rounded'
              : status === 'completed'
                ? 'bg-[#86CFAC] h-[5px] rounded-sm'
                : 'bg-gray-200 h-[5px] rounded-sm';

          return (
            <button
              key={item.id}
              className={`flex-1 ${dotClass} transition-all hover:opacity-80`}
              onClick={() => onJumpTo(index)}
              aria-label={`Go to item ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
