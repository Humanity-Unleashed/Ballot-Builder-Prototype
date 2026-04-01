'use client';

import React, { useState } from 'react';
import type { Candidate, CandidateMatch, VoteChoice } from '@/lib/ballotHelpers';
import CandidateCard from './CandidateCard';
import CandidateComparisonSheet from './CandidateComparisonSheet';

interface CandidateVoteButtonsProps {
  candidates: Candidate[];
  allowWriteIn: boolean;
  selected: VoteChoice;
  writeInName: string;
  matches: CandidateMatch[];
  onSelect: (choice: string) => void;
  onWriteInChange: (name: string) => void;
}

export default function CandidateVoteButtons({
  candidates,
  allowWriteIn,
  selected,
  writeInName,
  matches,
  onSelect,
  onWriteInChange,
}: CandidateVoteButtonsProps) {
  const [compareCandidate, setCompareCandidate] = useState<Candidate | null>(null);
  const isWriteIn = selected === 'write_in';

  const getMatch = (candidateId: string) => matches.find((m) => m.candidateId === candidateId);

  // Sort by match percentage (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => {
    const matchA = getMatch(a.id)?.matchPercent || 0;
    const matchB = getMatch(b.id)?.matchPercent || 0;
    return matchB - matchA;
  });

  return (
    <div className="space-y-2.5">
      <span className="block text-[11px] font-bold text-gray-500 tracking-wide">
        SELECT ONE CANDIDATE
      </span>
      <p className="text-[11px] text-gray-500 leading-[15px] -mt-1">
        Match scores reflect how closely each candidate aligns with the values you shared in your
        Civic Blueprint
      </p>

      <div className="space-y-2.5">
        {sortedCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selected === candidate.id}
            match={getMatch(candidate.id)}
            onSelect={() => onSelect(candidate.id)}
            onCompare={() => setCompareCandidate(candidate)}
          />
        ))}

        {/* Write-in option */}
        {allowWriteIn && (
          <button
            onClick={() => onSelect('write_in')}
            className={[
              'w-full flex items-start gap-2.5 p-3 rounded-xl border-2 text-left',
              isWriteIn
                ? 'border-brand-primary bg-brand-primary/[0.03]'
                : 'border-border-default bg-white',
            ].join(' ')}
          >
            {/* Radio */}
            <div
              className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
                isWriteIn ? 'border-brand-primary bg-brand-primary' : 'border-gray-300',
              ].join(' ')}
            >
              {isWriteIn && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <span
                className={`text-[15px] font-bold leading-5 ${isWriteIn ? 'text-brand-primary' : 'text-gray-900'}`}
              >
                Write-in candidate
              </span>
              {isWriteIn && (
                <input
                  type="text"
                  className="mt-2 w-full p-3 rounded-xl border border-border-default bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter candidate name..."
                  value={writeInName}
                  onChange={(e) => onWriteInChange(e.target.value)}
                  autoFocus
                />
              )}
            </div>

          </button>
        )}
      </div>

      {/* Comparison sheet */}
      <CandidateComparisonSheet
        visible={compareCandidate !== null}
        candidate={compareCandidate}
        match={compareCandidate ? getMatch(compareCandidate.id) : undefined}
        onClose={() => setCompareCandidate(null)}
      />
    </div>
  );
}
