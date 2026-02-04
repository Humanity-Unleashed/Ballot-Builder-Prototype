'use client';

import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { Candidate, CandidateMatch } from '@/lib/ballotHelpers';

interface CandidateComparisonSheetProps {
  visible: boolean;
  candidate: Candidate | null;
  match: CandidateMatch | undefined;
  onClose: () => void;
}

export default function CandidateComparisonSheet({
  visible,
  candidate,
  match,
  onClose,
}: CandidateComparisonSheetProps) {
  if (!visible || !candidate || !match) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl max-h-[75vh] pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex-1">
            Comparing with {candidate.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-3">
          <p className="text-sm text-gray-600 italic mb-4">
            Based on the values you shared, here&apos;s how you compare:
          </p>

          {match.axisComparisons.map((comparison) => {
            const isAgreement =
              comparison.alignment === 'strong' || comparison.alignment === 'moderate';
            const AlignIcon = isAgreement ? CheckCircle : XCircle;
            const alignmentColor = isAgreement ? 'text-green-500' : 'text-red-500';

            return (
              <div key={comparison.axisId} className="bg-gray-50 rounded-xl p-3.5 space-y-2.5">
                {/* Axis name + icon */}
                <div className="flex items-center gap-2.5">
                  <AlignIcon className={`h-[18px] w-[18px] ${alignmentColor}`} />
                  <span className="text-[15px] font-bold text-gray-800">
                    {comparison.axisName}
                  </span>
                </div>

                {/* Stance comparison */}
                <div className="pl-7 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-[13px] font-semibold text-gray-500 w-14 shrink-0">
                      You:
                    </span>
                    <span className="text-[13px] text-gray-700 flex-1 leading-[18px]">
                      {comparison.userLabel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[13px] font-semibold text-gray-500 w-14 shrink-0">
                      {candidate.name.split(' ')[0]}:
                    </span>
                    <span className="text-[13px] text-gray-700 flex-1 leading-[18px]">
                      {comparison.candidateLabel}
                    </span>
                  </div>
                </div>

                {/* Agreement summary */}
                <p className={`text-xs font-semibold pl-7 mt-0.5 ${alignmentColor}`}>
                  {isAgreement
                    ? 'You share similar views on this'
                    : 'You have different perspectives here'}
                </p>
              </div>
            );
          })}

          {/* Overall summary */}
          <div className="pt-3 border-t border-gray-200 mt-1">
            <p className="text-sm font-semibold text-gray-600 text-center">
              You align on{' '}
              {
                match.axisComparisons.filter(
                  (c) => c.alignment === 'strong' || c.alignment === 'moderate'
                ).length
              }{' '}
              of {match.axisComparisons.length} policy areas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
