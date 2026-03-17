'use client';

import React from 'react';

interface AssessmentProgressProps {
  /** 0-100 percentage based on entropy reduction */
  progress: number;
  /** How many questions the user has answered */
  questionsAnswered: number;
  /** Estimated remaining questions */
  estimatedRemaining: number;
}

export default function AssessmentProgress({
  progress,
  questionsAnswered,
  estimatedRemaining,
}: AssessmentProgressProps) {
  return (
    <div className="px-4 pt-3 pb-2">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-gray-400">
          {questionsAnswered} answered
        </span>
        <span className="text-[11px] text-gray-400">
          {estimatedRemaining > 0
            ? `~${estimatedRemaining} remaining`
            : 'Almost done'}
        </span>
      </div>
    </div>
  );
}
