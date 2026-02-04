'use client';

import React from 'react';
import { X, User, CheckCircle, XCircle } from 'lucide-react';
import type { PropositionRecommendation } from '@/lib/ballotHelpers';

interface PropositionBreakdownSheetProps {
  visible: boolean;
  recommendation: PropositionRecommendation;
  onClose: () => void;
}

export default function PropositionBreakdownSheet({
  visible,
  recommendation,
  onClose,
}: PropositionBreakdownSheetProps) {
  if (!visible || !recommendation || recommendation.breakdown.length === 0) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Sheet */}
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
          <h3 className="text-lg font-bold text-gray-900 flex-1">How we calculated this</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-3">
          <p className="text-sm text-gray-600 italic">
            We compare your values to what YES and NO mean for this measure:
          </p>

          {recommendation.breakdown.map((axis) => (
            <div
              key={axis.axisId}
              className="bg-gray-50 rounded-xl p-3.5 space-y-2 border-l-[3px] border-l-gray-300"
            >
              <p className="text-[15px] font-bold text-gray-800 mb-1">{axis.axisName}</p>

              {/* Your stance */}
              <div className="flex items-start gap-2">
                <User className="h-3.5 w-3.5 text-violet-600 mt-0.5 shrink-0" />
                <span className="text-[13px] text-gray-500 w-[85px] shrink-0">Your stance:</span>
                <span className="text-[13px] font-semibold text-gray-700 flex-1 leading-[18px]">
                  {axis.userStanceLabel}
                </span>
              </div>

              {/* YES means */}
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-[13px] text-gray-500 w-[85px] shrink-0">YES means:</span>
                <span className="text-[13px] font-semibold text-gray-700 flex-1 leading-[18px]">
                  {axis.yesAlignsWith}
                </span>
              </div>

              {/* NO means */}
              <div className="flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <span className="text-[13px] text-gray-500 w-[85px] shrink-0">NO means:</span>
                <span className="text-[13px] font-semibold text-gray-700 flex-1 leading-[18px]">
                  {axis.noAlignsWith}
                </span>
              </div>

              {/* Alignment badge */}
              <div
                className={[
                  'mt-2 self-start inline-block px-3 py-1.5 rounded-md',
                  axis.alignment === 'yes' && 'bg-green-100',
                  axis.alignment === 'no' && 'bg-red-100',
                  axis.alignment === 'neutral' && 'bg-gray-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="text-xs font-semibold text-gray-700">
                  {axis.alignment === 'yes'
                    ? '-> Your values suggest YES'
                    : axis.alignment === 'no'
                      ? '-> Your values suggest NO'
                      : '-> Neutral on this issue'}
                </span>
              </div>
            </div>
          ))}

          {/* Summary tally */}
          <div className="pt-3 border-t border-gray-200 mt-1">
            <p className="text-sm font-semibold text-gray-600 text-center">
              Overall: {recommendation.breakdown.filter((a) => a.alignment === 'yes').length} value(s)
              suggest YES,{' '}
              {recommendation.breakdown.filter((a) => a.alignment === 'no').length} suggest NO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
