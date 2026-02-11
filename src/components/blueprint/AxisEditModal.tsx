'use client';

import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RefreshCw, ChevronRight } from 'lucide-react';
import { getSliderConfig } from '@/data/sliderPositions';
import { getFineTuningConfig } from '@/data/fineTuningPositions';
import type { BlueprintProfile } from '@/types/blueprintProfile';
import type { Spec } from '@/types/civicAssessment';
import { valueToPositionIndex, DEFAULT_STRENGTH_VALUE } from '@/lib/blueprintHelpers';
import DomainLeanMeter from './DomainLeanMeter';
import StrengthChips from './StrengthChips';
import FineTuneBreakdownView from './FineTuneBreakdownView';

interface AxisEditModalProps {
  axisId: string;
  profile: BlueprintProfile;
  spec: Spec;
  onClose: () => void;
  onChangeAxisImportance: (axisId: string, value: number) => void;
  onChangeAxis: (axisId: string, value: number) => void;
  onFineTune: (axisId: string) => void;
  fineTuningResponses: Record<string, number>;
}

export default function AxisEditModal({
  axisId,
  profile,
  spec,
  onClose,
  onChangeAxisImportance,
  onChangeAxis,
  onFineTune,
  fineTuningResponses,
}: AxisEditModalProps) {
  const axisDef = spec.axes.find((a) => a.id === axisId);

  // Find axis data in profile
  let axisData = undefined as typeof profile.domains[0]['axes'][0] | undefined;
  for (const domain of profile.domains) {
    const found = domain.axes.find((a) => a.axis_id === axisId);
    if (found) {
      axisData = found;
      break;
    }
  }

  const config = getSliderConfig(axisId);
  const totalPositions = config?.positions.length || 5;
  const initialPositionIndex =
    axisData && config
      ? valueToPositionIndex(axisData.value_0_10, totalPositions)
      : 2;

  const [localPosition, setLocalPosition] = useState(initialPositionIndex);
  const [localImportance, setLocalImportance] = useState(
    axisData?.importance ?? DEFAULT_STRENGTH_VALUE,
  );

  const handleClose = () => {
    const newValue = Math.round((localPosition / (totalPositions - 1)) * 10);
    if (axisData && newValue !== axisData.value_0_10) {
      onChangeAxis(axisId, newValue);
    }
    if (axisData && localImportance !== (axisData.importance ?? DEFAULT_STRENGTH_VALUE)) {
      onChangeAxisImportance(axisId, localImportance);
    }
    onClose();
  };

  // Keep ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!axisDef || !axisData) return null;

  const fineTuningConfig = getFineTuningConfig(axisId);
  const hasFineTuningResponses = Object.keys(fineTuningResponses).length > 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Sheet */}
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-5">
          <h2 className="flex-1 pr-4 text-xl font-extrabold text-gray-900">{axisDef.name}</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-10">
          <p className="text-sm leading-5 text-gray-600">{axisDef.description}</p>

          {/* Position display */}
          {config && (
            <div className="rounded-xl border-2 border-violet-600/20 bg-violet-600/[0.04] p-4">
              <p className="text-center text-[15px] font-semibold text-gray-900">
                {config.positions[localPosition]?.title || 'Mixed'}
              </p>
              {config.positions[localPosition]?.description && (
                <p className="mt-1 text-center text-[13px] leading-[19px] text-gray-600">
                  {config.positions[localPosition].description}
                </p>
              )}
            </div>
          )}

          {/* Position slider */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Your position:
            </span>
            <DomainLeanMeter
              value={(localPosition / (totalPositions - 1)) * 100}
              leftLabel={(config?.poleALabel || axisDef.poleA.label).replace(/\n/g, ' ')}
              rightLabel={(config?.poleBLabel || axisDef.poleB.label).replace(/\n/g, ' ')}
              onChange={(v) => setLocalPosition(Math.round((v / 100) * (totalPositions - 1)))}
            />
          </div>

          <div className="h-px bg-gray-200" />

          {/* Importance chips */}
          <StrengthChips selectedValue={localImportance} onSelect={setLocalImportance} />

          {/* Fine-tuning section */}
          {fineTuningConfig && (
            <>
              <div className="h-px bg-gray-200" />

              {hasFineTuningResponses ? (
                <div className="space-y-3">
                  <FineTuneBreakdownView axisId={axisId} responses={fineTuningResponses} />
                  <button
                    onClick={() => onFineTune(axisId)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                  >
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600">
                      Re-fine-tune position
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onFineTune(axisId)}
                  className="flex w-full items-center gap-3 rounded-xl border border-violet-600/15 bg-violet-600/[0.03] p-3.5"
                >
                  <SlidersHorizontal className="h-[18px] w-[18px] shrink-0 text-violet-600" />
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-semibold text-violet-600">
                      Fine-tune my position
                    </span>
                    <span className="block text-xs text-gray-500">
                      {fineTuningConfig.subDimensions.length} sub-topics to explore
                    </span>
                  </div>
                  <ChevronRight className="h-[18px] w-[18px] text-gray-400" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-5">
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-violet-600 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
