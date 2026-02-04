'use client';

import React, { useMemo } from 'react';
import { Sparkles, BarChart3, ExternalLink } from 'lucide-react';
import type { Candidate, CandidateMatch } from '@/lib/ballotHelpers';
import type { MetaDimensionScores } from '@/lib/archetypes';
import { getAxisMetaDimension } from '@/lib/archetypes';
import { getValueFraming } from '@/lib/valueFraming';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  match: CandidateMatch | undefined;
  onSelect: () => void;
  onCompare: () => void;
  metaDimensions: MetaDimensionScores | null;
}

export default function CandidateCard({
  candidate,
  isSelected,
  match,
  onSelect,
  onCompare,
  metaDimensions,
}: CandidateCardProps) {
  const matchPercent = match?.matchPercent || 0;
  const isBestMatch = match?.isBestMatch || false;

  // Value-framed agreement / disagreement lines
  const valueFramedReasons = useMemo(() => {
    if (!match || !metaDimensions || match.axisComparisons.length === 0) return null;

    const agreementsByDim: Record<string, string[]> = {};
    const disagreementsByDim: Record<string, string[]> = {};

    for (const comp of match.axisComparisons) {
      const dims = getAxisMetaDimension(comp.axisId);
      const dim = dims[0];
      if (!dim) continue;

      if (comp.difference <= 2) {
        if (!agreementsByDim[dim]) agreementsByDim[dim] = [];
        agreementsByDim[dim].push(comp.axisName);
      } else if (comp.difference >= 4) {
        if (!disagreementsByDim[dim]) disagreementsByDim[dim] = [];
        disagreementsByDim[dim].push(comp.axisName);
      }
    }

    const agreements: { axes: string; phrase: string }[] = [];
    const disagreements: { axes: string; phrase: string }[] = [];

    for (const [dim, axes] of Object.entries(agreementsByDim)) {
      const framing = getValueFraming(
        dim as keyof MetaDimensionScores,
        metaDimensions[dim as keyof MetaDimensionScores]
      );
      const phrase = framing ? framing.fragments.alignmentPhrase : '';
      agreements.push({ axes: axes.join(', '), phrase });
    }

    for (const [dim, axes] of Object.entries(disagreementsByDim)) {
      const framing = getValueFraming(
        dim as keyof MetaDimensionScores,
        metaDimensions[dim as keyof MetaDimensionScores]
      );
      const phrase = framing ? framing.fragments.tensionPhrase : '';
      disagreements.push({ axes: axes.join(', '), phrase });
    }

    return {
      agreements: agreements.slice(0, 2),
      disagreements: disagreements.slice(0, 1),
    };
  }, [match, metaDimensions]);

  const hasValueReasons =
    valueFramedReasons &&
    (valueFramedReasons.agreements.length > 0 || valueFramedReasons.disagreements.length > 0);

  // Border classes
  const borderClass = isSelected
    ? 'border-violet-600 bg-violet-600/[0.03]'
    : isBestMatch
      ? 'border-green-300 bg-green-50'
      : 'border-gray-200 bg-white';

  // Match circle classes
  const matchCircleClass =
    matchPercent >= 70
      ? 'border-green-500 bg-green-50'
      : matchPercent >= 40
        ? 'border-amber-500 bg-amber-50'
        : 'border-gray-300 bg-gray-50';

  return (
    <div className={`p-3 rounded-xl border-2 ${borderClass}`}>
      {/* Main row: radio + info + match */}
      <button
        onClick={onSelect}
        className="flex items-start gap-2.5 w-full text-left"
      >
        {/* Radio */}
        <div
          className={[
            'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
            isSelected ? 'border-violet-600 bg-violet-600' : 'border-gray-300',
          ].join(' ')}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Candidate info */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[15px] font-bold leading-5 ${isSelected ? 'text-violet-600' : 'text-gray-900'}`}
            >
              {candidate.name}
            </span>
            {candidate.incumbent && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                Incumbent
              </span>
            )}
          </div>

          {candidate.party && (
            <p className="text-[13px] text-gray-500 leading-[18px]">{candidate.party}</p>
          )}

          {candidate.profile.summary && (
            <p className="text-xs text-gray-600 leading-[17px] mt-1 line-clamp-2">
              {candidate.profile.summary}
            </p>
          )}

          {/* Value-framed match info */}
          {hasValueReasons ? (
            <div className="mt-1.5 space-y-0.5">
              {valueFramedReasons.agreements.length > 0 && (
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Where you align
                </span>
              )}
              {valueFramedReasons.agreements.map((a, i) => (
                <p key={`a-${i}`} className="text-[11px] text-green-600 leading-[15px]">
                  <span className="font-bold">{a.axes}</span>
                  {a.phrase ? `: ${a.phrase}` : ''}
                </p>
              ))}
              {valueFramedReasons.disagreements.length > 0 && (
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                  Where you differ
                </span>
              )}
              {valueFramedReasons.disagreements.map((d, i) => (
                <p key={`d-${i}`} className="text-[11px] text-amber-500 leading-[15px]">
                  <span className="font-bold">{d.axes}</span>
                  {d.phrase ? `: ${d.phrase}` : ''}
                </p>
              ))}
            </div>
          ) : match &&
            (match.keyAgreements.length > 0 || match.keyDisagreements.length > 0) ? (
            <div className="mt-1.5 space-y-0.5">
              {match.keyAgreements.length > 0 && (
                <p className="text-[11px] text-green-600 leading-[15px]">
                  Where you align: {match.keyAgreements.join(', ')}
                </p>
              )}
              {match.keyDisagreements.length > 0 && (
                <p className="text-[11px] text-amber-500 leading-[15px]">
                  Where you differ: {match.keyDisagreements.join(', ')}
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Match percentage circle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {isBestMatch && (
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mb-0.5">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          <div
            className={`w-11 h-11 rounded-full border-[2.5px] flex flex-col items-center justify-center ${matchCircleClass}`}
          >
            <span className="text-[13px] font-extrabold text-gray-900">{matchPercent}%</span>
            <span className="text-[8px] text-gray-500 uppercase">match</span>
          </div>
        </div>
      </button>

      {/* Compare link */}
      {match && match.axisComparisons.length > 0 && (
        <button
          onClick={onCompare}
          className="flex items-center justify-center gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100 w-full hover:opacity-80 transition-opacity"
        >
          <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[13px] font-semibold text-blue-500">See how we compare</span>
          <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
        </button>
      )}
    </div>
  );
}
