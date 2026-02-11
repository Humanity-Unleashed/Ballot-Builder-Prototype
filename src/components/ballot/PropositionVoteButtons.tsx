'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ValuePropositionRecommendation, VoteChoice } from '@/lib/ballotHelpers';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

interface PropositionVoteButtonsProps {
  selected: VoteChoice;
  onSelect: (choice: 'yes' | 'no') => void;
  recommendation: ValuePropositionRecommendation;
}

export default function PropositionVoteButtons({
  selected,
  onSelect,
  recommendation,
}: PropositionVoteButtonsProps) {
  const { track } = useAnalyticsContext();
  const isYesRecommended = recommendation.vote === 'yes';
  const isNoRecommended = recommendation.vote === 'no';

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold text-gray-500 tracking-wide">YOUR VOTE</span>

      <div className="flex gap-2.5">
        {/* YES button */}
        <button
          onClick={() => { track('click', { element: 'vote_yes' }); onSelect('yes'); }}
          className={[
            'relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-colors',
            selected === 'yes'
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-green-50 border-green-500 text-gray-700',
          ].join(' ')}
        >
          {isYesRecommended && selected !== 'yes' && (
            <span className="absolute -top-2 right-2 bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Recommended
            </span>
          )}
          <CheckCircle
            className={`h-5 w-5 ${selected === 'yes' ? 'text-white' : 'text-green-500'}`}
          />
          <span className="text-base font-extrabold">YES</span>
        </button>

        {/* NO button */}
        <button
          onClick={() => { track('click', { element: 'vote_no' }); onSelect('no'); }}
          className={[
            'relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-colors',
            selected === 'no'
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-red-50 border-red-500 text-gray-700',
          ].join(' ')}
        >
          {isNoRecommended && selected !== 'no' && (
            <span className="absolute -top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Recommended
            </span>
          )}
          <XCircle
            className={`h-5 w-5 ${selected === 'no' ? 'text-white' : 'text-red-500'}`}
          />
          <span className="text-base font-extrabold">NO</span>
        </button>
      </div>
    </div>
  );
}
