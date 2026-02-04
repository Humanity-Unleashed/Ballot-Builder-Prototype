'use client';

import React from 'react';
import type { MetaDimensionScores } from '@/lib/archetypes';
import type { ValueFramingConfig } from '@/lib/valueFraming';
import {
  SPECTRUM_BARS,
  scoreToPercents,
  getGraduatedLabel,
} from '@/lib/blueprintHelpers';

interface ValueSummaryCardProps {
  summary: string;
  framings: ValueFramingConfig[];
  metaDimensions: MetaDimensionScores;
}

export default function ValueSummaryCard({
  summary,
  framings,
  metaDimensions,
}: ValueSummaryCardProps) {
  // Build per-dimension detail items
  const dimensionDetails = framings
    .map((f) => {
      const bar = SPECTRUM_BARS.find((b) => b.key === f.metaDimension);
      if (!bar) return null;
      const { leftPct, rightPct } = scoreToPercents(metaDimensions[bar.key], bar.invert);
      const { label: winnerLabel, color: winnerColor } = getGraduatedLabel(leftPct, rightPct, bar);
      return { framing: f, bar, winnerLabel, winnerColor };
    })
    .filter(Boolean) as {
    framing: ValueFramingConfig;
    bar: (typeof SPECTRUM_BARS)[0];
    winnerLabel: string;
    winnerColor: string;
  }[];

  // Render the narrative summary, bolding coreValueLabels
  const renderSummaryText = () => {
    if (framings.length === 0) {
      return <p className="text-[15px] leading-[22px] text-gray-700">{summary}</p>;
    }

    const labels = framings.map((f) => f.coreValueLabel);
    const pattern = new RegExp(
      `(${labels.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'g',
    );
    const parts = summary.split(pattern);

    return (
      <p className="text-[15px] leading-[22px] text-gray-700">
        {parts.map((part, i) =>
          labels.includes(part) ? (
            <strong key={i} className="font-bold text-violet-800">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
    );
  };

  return (
    <div className="mb-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-violet-600">
        YOUR CIVIC PERSPECTIVE
      </span>
      {renderSummaryText()}

      {dimensionDetails.length > 0 && (
        <div className="mt-3.5 space-y-2.5">
          {dimensionDetails.map(({ framing, bar, winnerLabel, winnerColor }) => (
            <div
              key={framing.metaDimension}
              className="space-y-1.5 rounded-xl bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: winnerColor }}>
                  {winnerLabel}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {bar.axisName}
                </span>
              </div>
              <p className="text-[13px] leading-[19px] text-gray-600">
                You value {framing.shortPhrase}. {framing.resonanceFraming}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
