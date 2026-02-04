'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { getFineTuningBreakdown, calculateFineTunedScore } from '@/data/fineTuningPositions';

interface FineTuneBreakdownViewProps {
  axisId: string;
  responses: Record<string, number>;
}

export default function FineTuneBreakdownView({ axisId, responses }: FineTuneBreakdownViewProps) {
  const breakdown = getFineTuningBreakdown(axisId, responses);
  const overallScore = calculateFineTunedScore(axisId, responses);

  if (breakdown.length === 0) return null;

  const getAccentColor = (score: number) => {
    if (score <= -0.3) return '#8B7AAF';
    if (score >= 0.3) return '#5B9E94';
    return '#6B7280';
  };

  return (
    <div className="space-y-2">
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
        Your fine-tuned positions
      </h4>

      {breakdown.map((item) => (
        <div
          key={item.subDimensionId}
          className="rounded-lg bg-violet-50 p-2.5"
          style={{ borderLeft: `4px solid ${getAccentColor(item.score)}` }}
        >
          <p className="mb-0.5 text-xs font-semibold text-gray-500">{item.name}</p>
          <p className="text-[13px] font-semibold leading-[18px] text-gray-900">
            {item.positionTitle}
          </p>
        </div>
      ))}

      {overallScore !== null && (
        <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-gray-100 p-2.5">
          <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-[13px] font-semibold text-gray-600">
            Overall:{' '}
            {overallScore <= -0.3
              ? 'Leans progressive'
              : overallScore >= 0.3
                ? 'Leans conservative'
                : 'Mixed / balanced'}
          </span>
        </div>
      )}
    </div>
  );
}
