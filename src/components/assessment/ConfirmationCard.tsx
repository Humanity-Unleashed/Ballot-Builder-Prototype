'use client';

import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import type { ConfirmationCard as ConfirmationCardType } from '@/types/hybridAssessment';

interface ConfirmationCardProps {
  card: ConfirmationCardType;
  /** Called with the axis IDs the user confirmed */
  onConfirm: (confirmedAxisIds: string[]) => void;
  disabled?: boolean;
}

export default function ConfirmationCard({
  card,
  onConfirm,
  disabled = false,
}: ConfirmationCardProps) {
  const [checkedAxes, setCheckedAxes] = useState<Set<string>>(new Set());

  const toggleAxis = (axisId: string) => {
    if (disabled) return;
    setCheckedAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axisId)) {
        next.delete(axisId);
      } else {
        next.add(axisId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (disabled) return;
    onConfirm(Array.from(checkedAxes));
  };

  return (
    <div className="mx-4 my-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[14px] font-semibold text-gray-900">
          We picked up a few things from your response:
        </p>
      </div>

      {/* Signal list */}
      <div className="px-4 pb-2 space-y-1.5">
        {/* Primary — always checked and locked */}
        <div className="flex items-start gap-3 p-2.5 rounded-lg bg-brand-primary/[0.04]">
          <div className="w-5 h-5 rounded border-2 border-brand-primary bg-brand-primary flex items-center justify-center mt-0.5 shrink-0">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium text-gray-900">
              {card.primary.positionLabel}
            </span>
          </div>
          <Lock className="h-3.5 w-3.5 text-gray-300 mt-1 shrink-0" />
        </div>

        {/* Secondary signals — checkboxes */}
        {card.secondary.map((signal) => {
          const isChecked = checkedAxes.has(signal.axisId);

          return (
            <button
              key={signal.axisId}
              onClick={() => toggleAxis(signal.axisId)}
              disabled={disabled}
              className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                isChecked
                  ? 'bg-green-50/50'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                  isChecked
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}
              >
                {isChecked && (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-[13px] text-gray-700">
                {signal.positionLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Help text + confirm button */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-[11px] text-gray-400 mb-3">
          Check the ones that sound right — we&apos;ll skip those questions later.
        </p>
        <button
          onClick={handleConfirm}
          disabled={disabled}
          className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-40"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
