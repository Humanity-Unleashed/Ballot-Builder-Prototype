'use client';

import React from 'react';
import type { ConversationSession } from '@/types/conversation';

interface ConversationProgressProps {
  session: ConversationSession;
}

export default function ConversationProgress({ session }: ConversationProgressProps) {
  const { itemOrder, currentItemIndex, items } = session;

  return (
    <div className="flex flex-col gap-1">
      {/* Segmented progress bar — no text labels, just visual */}
      <div className="flex gap-0.5">
        {itemOrder.map((itemId, index) => {
          const item = items[itemId];
          const status = item?.status || 'pending';

          let color: string;
          if (index === currentItemIndex) {
            color = 'bg-brand-primary';
          } else if (status === 'voted') {
            color = 'bg-green-500';
          } else if (status === 'skipped') {
            color = 'bg-amber-400';
          } else {
            color = 'bg-gray-200';
          }

          return (
            <div
              key={itemId}
              className={`h-1 flex-1 rounded-full ${color} transition-colors`}
            />
          );
        })}
      </div>
    </div>
  );
}
