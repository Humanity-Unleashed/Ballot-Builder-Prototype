'use client';

import React from 'react';
import { X, Check, AlertTriangle, Minus, ExternalLink } from 'lucide-react';
import type { Candidate, CandidateMatch, CandidateAxisComparison } from '@/lib/ballotHelpers';

function EvidenceRow({ evidence }: { evidence: { text: string; url?: string }[] }) {
  return (
    <p className="text-[11px] text-gray-400 leading-[15px] mt-0.5">
      Based on:{' '}
      {evidence.map((e, i) => (
        <span key={i}>
          {i > 0 && '; '}
          {e.url ? (
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary/70 hover:text-brand-primary underline decoration-dotted inline-flex items-center gap-0.5"
              onClick={(ev) => ev.stopPropagation()}
            >
              {e.text}
              <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
            </a>
          ) : (
            e.text
          )}
        </span>
      ))}
    </p>
  );
}

interface CandidateComparisonSheetProps {
  visible: boolean;
  candidate: Candidate | null;
  match: CandidateMatch | undefined;
  onClose: () => void;
}

export default function CandidateComparisonSheet({
  visible,
  candidate,
  match,
  onClose,
}: CandidateComparisonSheetProps) {
  if (!visible || !candidate || !match) return null;

  // Separate aligned and conflicting axes
  const alignedDetails = match.axisComparisons.filter(
    (d) => d.alignment === 'strong' || d.alignment === 'moderate'
  );
  const conflictingDetails = match.axisComparisons.filter((d) => d.alignment === 'opposed');
  const neutralDetails = match.axisComparisons.filter((d) => d.alignment === 'weak');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-500">{match.matchPercent}% match with your values</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Full summary */}
          {candidate.profile.summary && (
            <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
              {candidate.profile.summary}
            </p>
          )}

          {/* Policy positions */}
          {candidate.profile.positions && candidate.profile.positions.length > 0 && (
            <ul className="mt-2 space-y-1">
              {candidate.profile.positions.map((position, i) => (
                <li key={i} className="text-[12px] text-gray-500 leading-[17px] flex items-start gap-1.5">
                  <span className="text-gray-400 mt-0.5 shrink-0">&bull;</span>
                  <span>{position}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 space-y-4">
          {/* Where you align */}
          {alignedDetails.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">
                Where you align
              </p>
              {alignedDetails.map((detail) => (
                <div key={detail.axisId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">{detail.axisName}:</strong>{' '}
                      You: {detail.userLabel} / Candidate: {detail.candidateLabel}
                    </p>
                    {detail.candidateEvidence && detail.candidateEvidence.length > 0 && (
                      <EvidenceRow evidence={detail.candidateEvidence} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Where you differ */}
          {conflictingDetails.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                Where you differ
              </p>
              {conflictingDetails.map((detail) => (
                <div key={detail.axisId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">{detail.axisName}:</strong>{' '}
                      You: {detail.userLabel} / Candidate: {detail.candidateLabel}
                    </p>
                    {detail.candidateEvidence && detail.candidateEvidence.length > 0 && (
                      <EvidenceRow evidence={detail.candidateEvidence} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Neutral areas (if any significant ones) */}
          {neutralDetails.length > 0 && alignedDetails.length + conflictingDetails.length < 4 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Similar stance on
              </p>
              {neutralDetails.slice(0, 2).map((detail) => (
                <div key={detail.axisId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Minus className="h-3 w-3 text-gray-500" />
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed flex-1">
                    {detail.axisName}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* No data case */}
          {match.axisComparisons.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              We don&apos;t have enough data about this candidate&apos;s positions to show a detailed comparison.
            </p>
          )}

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed text-center">
                {alignedDetails.length > conflictingDetails.length ? (
                  <>
                    <strong className="text-green-600">Overall:</strong> You share common ground on{' '}
                    {alignedDetails.length} key value{alignedDetails.length !== 1 ? 's' : ''}
                    {conflictingDetails.length > 0 &&
                      `, with some differences on ${conflictingDetails.length}`}
                    .
                  </>
                ) : conflictingDetails.length > alignedDetails.length ? (
                  <>
                    <strong className="text-amber-600">Overall:</strong> You differ on{' '}
                    {conflictingDetails.length} key value{conflictingDetails.length !== 1 ? 's' : ''}
                    {alignedDetails.length > 0 &&
                      `, but align on ${alignedDetails.length}`}
                    .
                  </>
                ) : (
                  <>
                    <strong className="text-gray-600">Overall:</strong> Mixed alignment — you agree and disagree on roughly equal terms.
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
