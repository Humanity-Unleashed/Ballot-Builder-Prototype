'use client';

import React from 'react';
import { Check, MessageSquareText } from 'lucide-react';
import type { ClassifiedSignal } from '@/types/hybridAssessment';
import { axisSliderConfigs } from '@/data/sliderPositions';

interface SignalReviewCardProps {
  /** The user's original text input */
  userText: string;
  /** Classified signals extracted from the input */
  signals: ClassifiedSignal[];
  /** Called when user confirms the extraction is correct */
  onAccept: () => void;
  /** Called when user wants to clarify / re-answer */
  onRefine: () => void;
  disabled?: boolean;
}

/** Human-readable axis name */
function getAxisShortName(axisId: string): string {
  const config = axisSliderConfigs[axisId];
  if (!config) return axisId;
  // Use the question text, trimmed
  return config.question.replace(/^Should /, '').replace(/^How should /, '').replace(/\?$/, '');
}

/** Confidence label */
function getConfidenceLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.6) return { label: 'High', color: 'text-green-600' };
  if (confidence >= 0.3) return { label: 'Medium', color: 'text-amber-600' };
  return { label: 'Low', color: 'text-gray-500' };
}

export default function SignalReviewCard({
  userText,
  signals,
  onAccept,
  onRefine,
  disabled = false,
}: SignalReviewCardProps) {
  // Only show primary and secondary signals (not spillover)
  const visibleSignals = signals.filter((s) => s.strength !== 'spillover');
  const axesCount = visibleSignals.length;

  // Overall confidence = average of visible signal confidences
  const avgConfidence =
    visibleSignals.reduce((sum, s) => sum + s.hybridConfidence, 0) /
    Math.max(1, visibleSignals.length);
  const { label: confLabel, color: confColor } = getConfidenceLabel(avgConfidence);

  return (
    <div className="mx-4 my-3 bg-green-50 rounded-2xl border-2 border-green-500 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
        <p className="text-[13px] font-semibold text-green-800">
          Got it — here&apos;s what we understood
        </p>
      </div>

      {/* User quote */}
      <div className="mx-4 mb-3 pl-3 border-l-[3px] border-green-300">
        <p className="text-[13px] text-gray-700 italic leading-relaxed line-clamp-4">
          &ldquo;{userText}&rdquo;
        </p>
      </div>

      {/* Per-axis signal bars */}
      <div className="px-4 pb-2 space-y-3">
        {visibleSignals.map((signal) => {
          const config = axisSliderConfigs[signal.axisId];
          const score = signal.rawSignal.direction; // 0-10
          const pct = Math.round((score / 10) * 100);

          return (
            <div key={signal.axisId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-500">
                  {getAxisShortName(signal.axisId)}
                </span>
                {signal.strength === 'secondary' && (
                  <span className="text-[9px] font-medium text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                    bonus
                  </span>
                )}
              </div>
              {/* Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute h-2 rounded-full bg-gradient-to-r from-[#8B7AAF] to-[#6C2BD9]"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-[-3px] w-[14px] h-[14px] bg-[#6C2BD9] border-2 border-white rounded-full shadow-sm"
                  style={{ left: `calc(${pct}% - 7px)` }}
                />
              </div>
              {/* LLM reasoning */}
              {signal.rawSignal.reasoning && (
                <p className="text-[11px] text-gray-500 leading-snug mt-1 italic">
                  {signal.rawSignal.reasoning}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Confidence summary */}
      <div className="px-4 pb-2">
        <p className="text-[11px] text-gray-500">
          Confidence: <strong className={confColor}>{confLabel}</strong>
          {axesCount > 1 && (
            <span> — your answer touched {axesCount} axes</span>
          )}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        <button
          onClick={onAccept}
          disabled={disabled}
          className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-[13px] font-semibold hover:bg-green-700 transition-colors disabled:opacity-40"
        >
          Looks right
        </button>
        <button
          onClick={onRefine}
          disabled={disabled}
          className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl text-[13px] font-semibold border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Not quite — let me clarify
        </button>
      </div>
    </div>
  );
}
