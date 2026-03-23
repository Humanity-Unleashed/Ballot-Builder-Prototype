'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';
import type { BallotItem } from '@/lib/ballotHelpers';

interface BallotItemHeaderProps {
  item: BallotItem;
}

export default function BallotItemHeader({ item }: BallotItemHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Item title */}
      <span className="text-xs font-bold text-brand-primary uppercase tracking-wide">
        {item.title}
      </span>

      {/* Official ballot language */}
      <div className="bg-white border border-border-default border-l-[3px] border-l-gray-500 rounded-xl p-3 space-y-1">
        <span className="block text-[10px] font-bold text-gray-400 tracking-wide">
          FROM YOUR BALLOT
        </span>
        <p className="text-lg font-bold text-gray-900 leading-snug">
          {item.questionText}
        </p>
      </div>

      {/* Explanation */}
      <div className="flex gap-2 bg-gray-100 p-2.5 rounded-xl items-start">
        <Lightbulb className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-0.5">
          <span className="block text-[10px] font-bold text-gray-400 tracking-wide uppercase">
            Why this matters
          </span>
          <p className="text-[13px] text-gray-600 leading-[19px]">
            {item.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
