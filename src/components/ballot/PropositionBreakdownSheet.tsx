'use client';

import React from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import type { ValuePropositionRecommendation } from '@/lib/ballotHelpers';

interface PropositionBreakdownSheetProps {
  visible: boolean;
  recommendation: ValuePropositionRecommendation;
  onClose: () => void;
}

// Generate value-framed resonance/tension phrases
function getResonancePhrase(valueName: string, effectDirection: number): string {
  // Positive effect on a value the user cares about
  if (effectDirection > 0.5) {
    return `This strongly supports your value of **${valueName}**`;
  }
  return `This aligns with your value of **${valueName}**`;
}

function getTensionPhrase(valueName: string, effectDirection: number): string {
  // Negative effect on a value the user cares about
  if (effectDirection < -0.5) {
    return `This may conflict with your value of **${valueName}**`;
  }
  return `This creates some tension with your value of **${valueName}**`;
}

function renderBoldText(text: string) {
  // Convert **text** to bold spans
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-gray-900 font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function PropositionBreakdownSheet({
  visible,
  recommendation,
  onClose,
}: PropositionBreakdownSheetProps) {
  if (!visible || !recommendation || recommendation.breakdown.length === 0) return null;

  // Separate into resonance (aligns) and tension (conflicts) based on alignment
  const resonanceItems = recommendation.breakdown.filter((item) => item.alignment === 'yes');
  const tensionItems = recommendation.breakdown.filter((item) => item.alignment === 'no');
  const neutralItems = recommendation.breakdown.filter((item) => item.alignment === 'neutral');

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl max-h-[75vh] pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex-1">How This Connects to Your Values</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Resonance section */}
          {resonanceItems.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">
                Where it aligns
              </p>
              {resonanceItems.map((item) => (
                <div key={item.valueId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed flex-1">
                    {renderBoldText(getResonancePhrase(item.valueName, item.effectDirection))}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tension section */}
          {tensionItems.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                Where it creates tension
              </p>
              {tensionItems.map((item) => (
                <div key={item.valueId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed flex-1">
                    {renderBoldText(getTensionPhrase(item.valueName, item.effectDirection))}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Neutral section (if any) */}
          {neutralItems.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Minimal effect on
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {neutralItems.map((item) => item.valueName).join(', ')}
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {recommendation.vote === 'yes' ? (
                  <>
                    <strong className="text-green-600">Overall:</strong> Voting YES aligns with{' '}
                    {resonanceItems.length} of your values
                    {tensionItems.length > 0 && `, though it may create tension with ${tensionItems.length}`}.
                  </>
                ) : recommendation.vote === 'no' ? (
                  <>
                    <strong className="text-red-600">Overall:</strong> Voting NO better matches your values.
                    {resonanceItems.length > 0 &&
                      ` YES would align with ${resonanceItems.length} value(s), but conflicts with ${tensionItems.length}.`}
                  </>
                ) : (
                  <>
                    <strong className="text-gray-600">Overall:</strong> This measure has mixed implications—
                    {resonanceItems.length} value(s) suggest YES, {tensionItems.length} suggest NO.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
