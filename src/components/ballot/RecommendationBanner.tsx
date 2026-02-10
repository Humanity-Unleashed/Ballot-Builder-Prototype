'use client';

import React, { useState } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import type { PropositionRecommendation } from '@/lib/ballotHelpers';
import PropositionBreakdownSheet from './PropositionBreakdownSheet';

interface RecommendationBannerProps {
  recommendation: PropositionRecommendation;
  valueFraming?: { resonance: string[]; tension: string[] };
}

export default function RecommendationBanner({
  recommendation,
  valueFraming,
}: RecommendationBannerProps) {
  const [showSheet, setShowSheet] = useState(false);

  const hasValuePhrases =
    valueFraming && (valueFraming.resonance.length > 0 || valueFraming.tension.length > 0);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Build summary text
  const summaryText = (() => {
    if (!recommendation.vote || recommendation.confidence < 0.2) {
      if (recommendation.factors.length > 0) {
        return `Your values on ${recommendation.factors.slice(0, 2).join(' and ')} pull in different directions on this one.`;
      }
      return 'This measure touches values you hold on both sides.';
    }
    return recommendation.explanation;
  })();

  // Vote line rendering
  const renderVoteLine = () => {
    if (!recommendation.vote || recommendation.confidence < 0.2) {
      return (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100">
          <HelpCircle className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="text-[13px] font-semibold text-gray-600 flex-1 leading-[18px]">
            Close call -- your values don&apos;t clearly favor either side
          </span>
        </div>
      );
    }
    const isYes = recommendation.vote === 'yes';
    return (
      <div
        className={[
          'flex items-center gap-2 px-3.5 py-2.5',
          isYes ? 'bg-green-50' : 'bg-red-50',
        ].join(' ')}
      >
        <Sparkles className={`h-4 w-4 shrink-0 ${isYes ? 'text-green-600' : 'text-red-600'}`} />
        <span
          className={`text-[13px] font-semibold flex-1 leading-[18px] ${isYes ? 'text-green-600' : 'text-red-600'}`}
        >
          Aligns with your values -- Vote {isYes ? 'YES' : 'NO'}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
      {renderVoteLine()}

      <div className="p-3 space-y-2">
        <p className="text-[13px] text-gray-600 leading-[19px]">{summaryText}</p>

        {hasValuePhrases && (
          <>
            {valueFraming.resonance.map((phrase, i) => (
              <div key={`r-${i}`} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-[5px] shrink-0" />
                <span className="text-[13px] text-gray-700 leading-[18px] flex-1">
                  {capitalize(phrase)}
                </span>
              </div>
            ))}
            {valueFraming.tension.map((phrase, i) => (
              <div key={`t-${i}`} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-[5px] shrink-0" />
                <span className="text-[13px] text-gray-700 leading-[18px] flex-1">
                  {capitalize(phrase)}
                </span>
              </div>
            ))}
          </>
        )}

        {recommendation.breakdown.length > 0 && (
          <button
            onClick={() => setShowSheet(true)}
            className="text-xs font-semibold text-blue-500 mt-1 hover:underline"
          >
            See full breakdown &rsaquo;
          </button>
        )}
      </div>

      <PropositionBreakdownSheet
        visible={showSheet}
        recommendation={recommendation}
        onClose={() => setShowSheet(false)}
      />
    </div>
  );
}
