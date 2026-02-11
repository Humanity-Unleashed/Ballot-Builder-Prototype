'use client';

import React from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import type { ValueAxis } from '@/lib/ballotHelpers';
import DomainLeanMeter from '@/components/blueprint/DomainLeanMeter';
import { getSliderConfig } from '@/data/sliderPositions';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

interface ValuesSectionProps {
  axes: ValueAxis[];
  relevantAxisIds: string[];
  onValueChange: (axisId: string, value: number) => void;
  expanded: boolean;
  onToggle: () => void;
}

export default function ValuesSection({
  axes,
  relevantAxisIds,
  onValueChange,
  expanded,
  onToggle,
}: ValuesSectionProps) {
  const { track } = useAnalyticsContext();
  const relevantAxes = axes.filter((a) => relevantAxisIds.includes(a.id));
  if (relevantAxes.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-[14px] border border-gray-200 overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => { track('click', { element: 'toggle_values', expanded: !expanded }); onToggle(); }}
        className="flex items-center justify-between w-full p-3.5 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          <span className="text-[15px] font-semibold text-gray-700">Adjust your values</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Body (visible when expanded) */}
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-3.5">
          <p className="text-[13px] text-gray-500 leading-[18px]">
            Changing these will update recommendations across your ballot.
          </p>
          {relevantAxes.map((axis) => {
            const pct = axis.value * 10;
            const config = getSliderConfig(axis.id);
            const positions = config?.positions;
            const stopCount = positions?.length ?? 5;
            const stopIdx = Math.round((pct / 100) * (stopCount - 1));
            const pos = positions?.[stopIdx];

            return (
              <div key={axis.id} className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">{axis.name}</span>
                <DomainLeanMeter
                  value={pct}
                  leftLabel={axis.poleA}
                  rightLabel={axis.poleB}
                  onChange={(v) => onValueChange(axis.id, v / 10)}
                />
                {pos && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600">{pos.title}</p>
                    <p className="text-[11px] text-gray-400 italic">{pos.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
