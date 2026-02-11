'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

interface NavigationButtonsProps {
  canGoBack: boolean;
  hasSelection: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

export default function NavigationButtons({
  canGoBack,
  hasSelection,
  onBack,
  onNext,
  onSkip,
  isLast,
}: NavigationButtonsProps) {
  const { track } = useAnalyticsContext();

  return (
    <div className="space-y-2 pt-1">
      {/* Primary action */}
      <button
        onClick={() => { track('click', { element: isLast ? 'finish_ballot' : 'save_continue' }); onNext(); }}
        disabled={!hasSelection}
        className={[
          'w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[15px] font-bold text-white transition-colors',
          hasSelection
            ? 'bg-violet-600 hover:bg-violet-700'
            : 'bg-gray-300 cursor-not-allowed',
        ].join(' ')}
      >
        <span>{isLast ? 'Finish Ballot' : 'Save & Continue'}</span>
        {isLast ? (
          <Check className="h-5 w-5 text-white" />
        ) : (
          <ArrowRight className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Secondary row */}
      <div className="flex gap-2.5">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={[
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border bg-white text-sm font-semibold transition-colors',
            canGoBack
              ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
              : 'border-gray-200 text-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          <ArrowLeft
            className={`h-[18px] w-[18px] ${canGoBack ? 'text-gray-600' : 'text-gray-300'}`}
          />
          <span>Back</span>
        </button>

        <button
          onClick={() => { track('click', { element: 'skip_item' }); onSkip(); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border border-gray-300 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>Skip for now</span>
        </button>
      </div>
    </div>
  );
}
