'use client';

import React from 'react';
import { X, Check, AlertTriangle, Minus } from 'lucide-react';
import type { Candidate, CandidateMatch, CandidateAxisComparison } from '@/lib/ballotHelpers';

/** Classify evidence text into a short source-domain label. */
function classifySource(text: string): string {
  const t = text.toLowerCase();
  if (/^campaign\b|campaign (platform|website|interview|position)|campaign:/.test(t)) return 'Campaign';
  if (/\b(voted|vote on|vote against|co-?authored|authored|sponsor|signed|passed|killed)\b/.test(t) ||
      /^(no|yes) vote\b/.test(t) || /^[hs][br]\s?\d/.test(t) || /^hr\s?\d/.test(t) ||
      /legislative record/.test(t)) return 'Voting record';
  if (/\b(rating|score|rated|scorecard|%)\b/.test(t) || /\d+%/.test(t) ||
      /\b(aclu|nra|afl-cio|sierra club|lcv|heritage action|planned parenthood|naral)\b/.test(t))
    return 'Ratings';
  if (/endorsement|endorsed\b/.test(t)) return 'Endorsements';
  if (/\b(interview|debate|forum|q&a|town hall)\b/.test(t)) return 'Public statements';
  if (/\b(survey|questionnaire|ivoterguide|ontheissues)\b/.test(t)) return 'Survey responses';
  if (/\b(sued|lawsuit|court|legal|attorney general)\b/.test(t)) return 'Legal actions';
  return 'Source';
}

function EvidenceRow({ evidence }: { evidence: { text: string; url?: string }[] }) {
  // Group evidence by source domain
  const groups = new Map<string, { text: string; url?: string; idx: number }[]>();
  evidence.forEach((e, idx) => {
    const domain = classifySource(e.text);
    if (!groups.has(domain)) groups.set(domain, []);
    groups.get(domain)!.push({ ...e, idx });
  });

  const domainEntries = Array.from(groups.entries());

  return (
    <p className="text-[11px] text-gray-400 leading-[15px] mt-0.5">
      Based on:{' '}
      {domainEntries.map(([domain, items], gi) => (
        <span key={domain}>
          {gi > 0 && ', '}
          {items.length === 1 && items[0].url ? (
            <a
              href={items[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary/70 hover:text-brand-primary underline decoration-dotted"
              onClick={(ev) => ev.stopPropagation()}
              title={items[0].text}
            >
              {domain}
            </a>
          ) : (
            <span title={items.map((it) => it.text).join('\n')}>
              {domain}
              {items.length > 1 && (
                <sup className="text-[9px] text-gray-400 ml-px">
                  {items.map((it, si) => (
                    <span key={si}>
                      {si > 0 && ','}
                      {it.url ? (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary/70 hover:text-brand-primary"
                          onClick={(ev) => ev.stopPropagation()}
                          title={it.text}
                        >
                          {si + 1}
                        </a>
                      ) : (
                        <span title={it.text}>{si + 1}</span>
                      )}
                    </span>
                  ))}
                </sup>
              )}
            </span>
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
  // Match the card thresholds: diff <= 2 = aligned, diff >= 4 = conflicting
  const alignedDetails = match.axisComparisons.filter(
    (d) => d.alignment === 'strong' || d.alignment === 'moderate'
  );
  const conflictingDetails = match.axisComparisons.filter(
    (d) => d.alignment === 'opposed' || (d.alignment === 'weak' && d.difference >= 4)
  );
  const neutralDetails = match.axisComparisons.filter(
    (d) => d.alignment === 'weak' && d.difference < 4
  );

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

          {/* Neutral areas */}
          {neutralDetails.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Similar stance on
              </p>
              {neutralDetails.slice(0, 3).map((detail) => (
                <div key={detail.axisId} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Minus className="h-3 w-3 text-gray-500" />
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
