'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getSliderConfig } from '@/data/sliderPositions';
import {
  valueToPositionIndex,
  getPositionLabel,
  getImportanceLabel,
  DEFAULT_STRENGTH_VALUE,
} from '@/lib/blueprintHelpers';

interface CompactAxisBarProps {
  name: string;
  value: number;
  poleALabel: string;
  poleBLabel: string;
  axisId: string;
  importance?: number;
  isFineTuned?: boolean;
}

export default function CompactAxisBar({
  name,
  value,
  axisId,
  importance,
  isFineTuned,
}: CompactAxisBarProps) {
  const config = getSliderConfig(axisId);
  const positionIndex = config ? valueToPositionIndex(value, config.positions.length) : -1;
  const currentPosition = config?.positions[positionIndex];
  const positionLabel = getPositionLabel(axisId, value);

  const getAccentColor = () => {
    if (value <= 3) return '#8B7AAF';
    if (value >= 7) return '#5B9E94';
    return '#6B7280';
  };

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 text-sm font-bold leading-[18px] text-gray-800">{name}</span>
        <span className="shrink-0 rounded-[10px] border border-violet-600 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
          {getImportanceLabel(importance ?? DEFAULT_STRENGTH_VALUE)}
        </span>
      </div>

      {/* Stance box */}
      <div
        className="rounded-lg bg-violet-50 p-3"
        style={{ borderLeft: `4px solid ${getAccentColor()}` }}
      >
        <span className="text-sm font-semibold leading-5 text-gray-900">
          {currentPosition?.title || positionLabel}
        </span>
      </div>

      {/* Fine-tuned badge */}
      {isFineTuned && (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-600">Position refined</span>
        </div>
      )}
    </div>
  );
}
