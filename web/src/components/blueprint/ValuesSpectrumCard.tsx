'use client';

import React from 'react';
import type { MetaDimensionScores } from '@/lib/archetypes';
import {
  SPECTRUM_BARS,
  scoreToPercents,
  getGraduatedLabel,
} from '@/lib/blueprintHelpers';

interface ValuesSpectrumCardProps {
  metaDimensions: MetaDimensionScores;
}

export default function ValuesSpectrumCard({ metaDimensions }: ValuesSpectrumCardProps) {
  return (
    <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-[15px] font-bold text-gray-900">Your Values Spectrum</h3>

      {SPECTRUM_BARS.map((bar) => {
        const { leftPct, rightPct } = scoreToPercents(metaDimensions[bar.key], bar.invert);
        const { label: winnerLabel, color: winnerColor } = getGraduatedLabel(leftPct, rightPct, bar);

        return (
          <div key={bar.key} className="mb-3.5">
            {/* Axis header */}
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {bar.axisName}
              </span>
              <span className="text-sm font-bold" style={{ color: winnerColor }}>
                {winnerLabel}
              </span>
            </div>

            {/* Bar row */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-8 text-xs font-bold"
                style={{ color: bar.leftColor }}
              >
                {leftPct}%
              </span>
              <div className="flex h-2.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-l-full"
                  style={{ width: `${leftPct}%`, backgroundColor: bar.leftColor }}
                />
                <div
                  className="h-full rounded-r-full"
                  style={{ width: `${rightPct}%`, backgroundColor: bar.rightColor }}
                />
              </div>
              <span
                className="w-8 text-right text-xs font-bold"
                style={{ color: bar.rightColor }}
              >
                {rightPct}%
              </span>
            </div>

            {/* Labels row */}
            <div className="mt-1 flex justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: bar.leftColor }}
              >
                {bar.leftLabel}
              </span>
              <span
                className="text-right text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: bar.rightColor }}
              >
                {bar.rightLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
