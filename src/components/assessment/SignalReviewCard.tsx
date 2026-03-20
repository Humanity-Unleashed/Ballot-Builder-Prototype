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

/** Map a 0-10 score to the nearest position card for an axis */
function scoreToPosition(axisId: string, score: number): { title: string; description: string } | null {
  const config = axisSliderConfigs[axisId];
  if (!config || config.positions.length === 0) return null;
  const count = config.positions.length;
  const index = Math.round((score / 10) * (count - 1));
  const clamped = Math.max(0, Math.min(count - 1, index));
  return config.positions[clamped];
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

      {/* Per-axis matched position cards */}
      <div className="px-4 pb-2 space-y-2.5">
        {visibleSignals.map((signal) => {
          const position = scoreToPosition(signal.axisId, signal.rawSignal.direction);

          return (
            <div
              key={signal.axisId}
              className="rounded-xl border-2 border-green-300 bg-white px-3.5 py-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-900">
                      {position?.title ?? 'Position detected'}
                    </span>
                    {signal.strength === 'secondary' && (
                      <span className="text-[9px] font-medium text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                        bonus
                      </span>
                    )}
                  </div>
                  {position?.description && (
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {position.description}
                    </p>
                  )}
                  {signal.rawSignal.reasoning && (
                    <p className="text-[12px] text-green-700 leading-snug mt-1.5 italic">
                      <MessageSquareText className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                      {signal.rawSignal.reasoning
                        .replace(/\s*\(?\bscore\s*\d+\.?\d*\)?\s*/gi, ' ')
                        .replace(/\s*\(?\bposition\s*\d+\)?\s*/gi, ' ')
                        .replace(/\s*which is on the \w+ axis\.?\s*/gi, ' ')
                        .replace(/\s*on the \w+ axis\.?\s*/gi, ' ')
                        .replace(/\s*\(\w+\)\s*axis\.?\s*/gi, ' ')
                        .replace(/\bpole [AB]\b/gi, '')
                        .replace(/\bthe user\b/gi, 'you')
                        .replace(/\s{2,}/g, ' ')
                        .trim()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence summary */}
      <div className="px-4 pb-2">
        <p className="text-[11px] text-gray-500">
          Confidence: <strong className={confColor}>{confLabel}</strong>
          {axesCount > 1 && (
            <span> — your answer touched {axesCount} topics</span>
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
