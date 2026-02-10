'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Candidate, CandidateMatch } from '@/lib/ballotHelpers';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  match: CandidateMatch | undefined;
  onSelect: () => void;
  onCompare: () => void;
}

export default function CandidateCard({
  candidate,
  isSelected,
  match,
  onSelect,
  onCompare,
}: CandidateCardProps) {
  const matchPercent = match?.matchPercent || 50;
  const isBestMatch = match?.isBestMatch || false;
  const alignedValues = match?.keyAgreements || [];
  const conflictingValues = match?.keyDisagreements || [];

  // Border classes
  const borderClass = isSelected
    ? 'border-violet-600 bg-violet-600/[0.03]'
    : isBestMatch
      ? 'border-green-300 bg-green-50'
      : 'border-gray-200 bg-white';

  // Match circle classes
  const matchCircleClass =
    matchPercent >= 65
      ? 'border-green-500 bg-green-50'
      : matchPercent >= 45
        ? 'border-amber-500 bg-amber-50'
        : 'border-gray-300 bg-gray-50';

  return (
    <div className={`p-3 rounded-xl border-2 ${borderClass}`}>
      {/* Main row: radio + info + match */}
      <button
        onClick={onSelect}
        className="flex items-start gap-2.5 w-full text-left"
      >
        {/* Radio */}
        <div
          className={[
            'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
            isSelected ? 'border-violet-600 bg-violet-600' : 'border-gray-300',
          ].join(' ')}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Candidate info */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[15px] font-bold leading-5 ${isSelected ? 'text-violet-600' : 'text-gray-900'}`}
            >
              {candidate.name}
            </span>
            {candidate.incumbent && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                Incumbent
              </span>
            )}
          </div>

          {candidate.party && (
            <p className="text-[13px] text-gray-500 leading-[18px]">{candidate.party}</p>
          )}

          {candidate.profile.summary && (
            <p className="text-xs text-gray-600 leading-[17px] mt-1 line-clamp-2">
              {candidate.profile.summary}
            </p>
          )}

          {/* Value-based match info */}
          {(alignedValues.length > 0 || conflictingValues.length > 0) && (
            <div className="mt-1.5 space-y-0.5">
              {alignedValues.length > 0 && (
                <>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Shared values
                  </span>
                  <p className="text-[11px] text-green-600 leading-[15px]">
                    {alignedValues.join(', ')}
                  </p>
                </>
              )}
              {conflictingValues.length > 0 && (
                <>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                    Different priorities
                  </span>
                  <p className="text-[11px] text-amber-500 leading-[15px]">
                    {conflictingValues.join(', ')}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Compare link */}
          {match && match.axisComparisons && match.axisComparisons.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare();
              }}
              className="text-xs font-semibold text-blue-500 mt-2 hover:underline"
            >
              See value comparison &rsaquo;
            </button>
          )}
        </div>

        {/* Match percentage circle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {isBestMatch && (
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mb-0.5">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          <div
            className={`w-11 h-11 rounded-full border-[2.5px] flex flex-col items-center justify-center ${matchCircleClass}`}
          >
            <span className="text-[13px] font-extrabold text-gray-900">{matchPercent}%</span>
            <span className="text-[8px] text-gray-500 uppercase">match</span>
          </div>
        </div>
      </button>
    </div>
  );
}
