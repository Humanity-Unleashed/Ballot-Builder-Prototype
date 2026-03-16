'use client';

import React from 'react';
import { Check, Sparkles, HelpCircle, MessageSquareText } from 'lucide-react';
import type { UserValueRecord } from '@/types/hybridAssessment';
import { DOMAIN_LABELS, DOMAIN_AXES } from '@/types/conversation';
import type { DomainId } from '@/types/conversation';
import { axisSliderConfigs } from '@/data/sliderPositions';

interface ProfileSummaryProps {
  /** Full 17-axis profile */
  profile: Record<string, UserValueRecord>;
  /** Called when user taps an imputed axis to answer directly */
  onOverrideAxis?: (axisId: string) => void;
  /** Called when user confirms the profile */
  onConfirm: () => void;
}

/** Get a human-readable position label for a score */
function getPositionLabel(axisId: string, score: number): string {
  const config = axisSliderConfigs[axisId];
  if (!config) return `${score.toFixed(1)}/10`;

  const posCount = config.positions.length;
  const index = Math.round((score / 10) * (posCount - 1));
  const clamped = Math.max(0, Math.min(posCount - 1, index));
  return config.positions[clamped].title;
}

/** Get the axis display name */
function getAxisName(axisId: string): string {
  const config = axisSliderConfigs[axisId];
  if (!config) return axisId;
  // Extract a short name from the question
  return config.question.replace(/^Should /, '').replace(/\?$/, '');
}

/** Source badge for provenance */
function SourceBadge({ record }: { record: UserValueRecord }) {
  if (record.isImputed) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-[10px] font-medium text-amber-600">
        <Sparkles className="h-2.5 w-2.5" />
        Inferred
      </span>
    );
  }
  if (record.sourceModality === 'nlp') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-[10px] font-medium text-purple-600">
        <MessageSquareText className="h-2.5 w-2.5" />
        Voice
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-500">
      <Check className="h-2.5 w-2.5" />
      Card
    </span>
  );
}

/** Confidence indicator — thin bar */
function ConfidenceBar({ confidence }: { confidence: number }) {
  const width = Math.round(confidence * 100);
  const color = confidence >= 0.6
    ? 'bg-green-400'
    : confidence >= 0.3
      ? 'bg-amber-400'
      : 'bg-gray-300';

  return (
    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

const DOMAIN_ORDER: DomainId[] = ['econ', 'health', 'housing', 'justice', 'climate'];

export default function ProfileSummary({
  profile,
  onOverrideAxis,
  onConfirm,
}: ProfileSummaryProps) {
  const answeredCount = Object.values(profile).filter(
    (r) => r.coverageStatus === 'answered',
  ).length;
  const imputedCount = Object.values(profile).filter(
    (r) => r.coverageStatus === 'imputed',
  ).length;
  const avgConfidence =
    Object.values(profile).reduce((s, r) => s + r.confidence, 0) /
    Math.max(1, Object.values(profile).length);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-xl font-bold text-gray-900">Your Civic Blueprint</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          {answeredCount} direct answers
          {imputedCount > 0 && ` + ${imputedCount} inferred`}
          {' '}&middot; Quality: {avgConfidence >= 0.6 ? 'High' : avgConfidence >= 0.3 ? 'Good' : 'Fair'}
        </p>
      </div>

      {/* Domain groups + CTA */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {DOMAIN_ORDER.map((domainId) => {
          const axisIds = DOMAIN_AXES[domainId] ?? [];
          const domainLabel = DOMAIN_LABELS[domainId];

          return (
            <div key={domainId} className="mb-4">
              <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                {domainLabel}
              </h3>

              <div className="space-y-1">
                {axisIds.map((axisId) => {
                  const record = profile[axisId];
                  if (!record) return null;

                  const isImputed = record.coverageStatus === 'imputed';
                  const isUncovered = record.coverageStatus === 'uncovered';

                  return (
                    <button
                      key={axisId}
                      onClick={
                        (isImputed || isUncovered) && onOverrideAxis
                          ? () => onOverrideAxis(axisId)
                          : undefined
                      }
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${
                        isImputed
                          ? 'border-dashed border-amber-200 bg-amber-50/30 hover:bg-amber-50/60'
                          : isUncovered
                            ? 'border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-800 truncate">
                            {getPositionLabel(axisId, record.score)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                            {getAxisName(axisId)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <ConfidenceBar confidence={record.confidence} />
                          <SourceBadge record={record} />
                        </div>
                      </div>

                      {(isImputed || isUncovered) && onOverrideAxis && (
                        <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                          <HelpCircle className="h-2.5 w-2.5" />
                          Tap to answer directly
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* CTA — inline at end of scroll area */}
        <div className="mt-4">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors"
          >
            Looks good — show my matches
          </button>
        </div>
      </div>
    </div>
  );
}
