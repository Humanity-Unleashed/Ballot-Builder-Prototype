'use client';

import React, { useState } from 'react';
import type { Candidate, ValueCandidateMatch, VoteChoice } from '@/lib/ballotHelpers';
import CandidateCard from './CandidateCard';
import CandidateComparisonSheet from './CandidateComparisonSheet';

interface CandidateVoteButtonsProps {
  candidates: Candidate[];
  allowWriteIn: boolean;
  selected: VoteChoice;
  writeInName: string;
  matches: ValueCandidateMatch[];
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
                ? 'border-violet-600 bg-violet-600/[0.03]'
                : 'border-gray-200 bg-white',
            ].join(' ')}
          >
            {/* Radio */}
            <div
              className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
                isWriteIn ? 'border-violet-600 bg-violet-600' : 'border-gray-300',
              ].join(' ')}
            >
              {isWriteIn && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <span
                className={`text-[15px] font-bold leading-5 ${isWriteIn ? 'text-violet-600' : 'text-gray-900'}`}
              >
                Write-in candidate
              </span>
              {isWriteIn && (
                <input
                  type="text"
                  className="mt-2 w-full p-3 rounded-[10px] border border-gray-300 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Enter candidate name..."
                  value={writeInName}
                  onChange={(e) => onWriteInChange(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Unknown match */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-11 h-11 rounded-full border-[2.5px] border-gray-200 bg-gray-50 flex items-center justify-center">
                <span className="text-[13px] font-extrabold text-gray-900">?</span>
              </div>
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
