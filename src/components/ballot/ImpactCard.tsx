'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BallotItem } from '@/lib/ballotHelpers';

interface ImpactCardProps {
  ballotItems: BallotItem[];
  sessionMinutes?: number;
}

// ── Time-saved estimation model ──
// See docs/TIME_SAVED_METHODOLOGY.md for full rationale and sources.
//
// The model accounts for three phases of independent ballot research:
//   1. Discovery: figuring out what's on your ballot and finding reliable sources
//   2. Per-item research: reading voter guides, candidate profiles, measure arguments
//   3. Decision-making: comparing options, weighing tradeoffs
//
// Most time estimates only cover phase 2. We include all three because Ballot
// Builder replaces the entire workflow — not just the reading.

const DISCOVERY_OVERHEAD = 15;           // finding your ballot, identifying sources, navigating portals
const MINUTES_PER_CANDIDATE_RACE = 7;   // 2 sources × 600 words ÷ 220 wpm + search overhead
const MINUTES_PER_BALLOT_MEASURE = 12;  // longer text, harder language, pro/con arguments
const DECISION_MINUTES_PER_ITEM = 2;    // weighing options after reading (no tool to help)
const CONSERVATIVE_MULTIPLIER = 0.5;    // some voters skim; this is the lower bound

function estimateManualResearchTime(numRaces: number, numMeasures: number) {
  const totalItems = numRaces + numMeasures;
  const midpoint =
    DISCOVERY_OVERHEAD +
    numRaces * MINUTES_PER_CANDIDATE_RACE +
    numMeasures * MINUTES_PER_BALLOT_MEASURE +
    totalItems * DECISION_MINUTES_PER_ITEM;

  const low = Math.round((midpoint * CONSERVATIVE_MULTIPLIER) / 5) * 5;
  const high = Math.round(midpoint / 5) * 5;

  return { low: Math.max(low, 10), high: Math.max(high, 15) };
}

const INSIGHTS = [
  {
    emoji: '📋',
    text: (
      <>
        <strong className="text-gray-800">1 in 3 voters</strong> leave down-ballot races blank. You reviewed every one.
      </>
    ),
    url: 'https://sisterdistrict.com/b/down-ballot-roll-off-patterns-in-2022/',
  },
  {
    emoji: '📖',
    text: (
      <>
        Ballot measures are written at a <strong className="text-gray-800">college reading level</strong>. You got plain-language breakdowns.
      </>
    ),
    url: 'https://ballotpedia.org/Ballot_measure_readability_scores,_2024',
  },
  {
    emoji: '🔍',
    text: (
      <>
        AI chatbots get election questions <strong className="text-gray-800">wrong 27% of the time</strong>. Your matches use voting records and public evidence.
      </>
    ),
    url: 'https://www.nbcnews.com/tech/tech-news/ai-chatbots-got-questions-2024-election-wrong-27-time-study-finds-rcna155640',
  },
  {
    emoji: '📊',
    text: (
      <>
        Traditional voter guides show <strong className="text-gray-800">no measurable impact</strong> on voter behavior — they mostly reach people who would vote anyway.
      </>
    ),
    url: 'https://www.science.org/doi/10.1126/sciadv.aaw2612',
  },
];

export default function ImpactCard({ ballotItems, sessionMinutes }: ImpactCardProps) {
  const [methodOpen, setMethodOpen] = useState(false);
  const races = ballotItems.filter((i) => i.type === 'candidate_race').length;
  const measures = ballotItems.filter((i) => i.type === 'proposition').length;
  const totalItems = races + measures;

  const estimate = estimateManualResearchTime(races, measures);
  const hasSession = sessionMinutes != null && sessionMinutes > 0;
  const savedLow = hasSession ? Math.max(estimate.low - sessionMinutes, 0) : null;
  const savedHigh = hasSession ? Math.max(estimate.high - sessionMinutes, 0) : null;

  return (
    <div className="mx-4 rounded-2xl border border-border-default bg-white overflow-hidden">
      {/* Gradient stats header */}
      <div
        className="px-5 py-4 text-white text-center"
        style={{ background: 'linear-gradient(to right, #3B1F6E, #2D1754)' }}
      >
        <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-1">
          Your ballot prep
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold">{races}</p>
            <p className="text-[11px] text-white/70">races</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-extrabold">{measures}</p>
            <p className="text-[11px] text-white/70">measures</p>
          </div>
          {hasSession && (
            <>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-extrabold">{sessionMinutes < 1 ? '<1' : sessionMinutes}</p>
                <p className="text-[11px] text-white/70">minutes</p>
              </div>
            </>
          )}
        </div>

        {/* Time saved comparison */}
        {hasSession && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/90 text-[13px] leading-snug">
              You completed your entire ballot prep in{' '}
              <strong>{sessionMinutes} minute{sessionMinutes !== 1 ? 's' : ''}</strong>.
              Doing comparable research on your own would likely take{' '}
              <strong>{estimate.low}&ndash;{estimate.high} minutes</strong>.
            </p>
            {savedLow != null && savedHigh != null && savedHigh > 0 && (
              <p className="text-white/70 text-[12px] mt-1.5">
                That&rsquo;s roughly{' '}
                <strong className="text-white/90">
                  {savedLow === savedHigh
                    ? `${savedHigh} minutes`
                    : `${savedLow}\u2013${savedHigh} minutes`}
                </strong>{' '}
                saved.
              </p>
            )}
          </div>
        )}

        {/* Fallback: no session timer, just show estimate */}
        {!hasSession && totalItems > 0 && (
          <p className="text-white/80 text-[13px] mt-3 pt-3 border-t border-white/20">
            Comparable research on {totalItems} item{totalItems !== 1 ? 's' : ''} would
            typically take {estimate.low}&ndash;{estimate.high} minutes.
          </p>
        )}
      </div>

      {/* How we estimated this — collapsible */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setMethodOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>How we estimated this</span>
          {methodOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {methodOpen && (
          <div className="px-4 pb-3 text-[12px] text-gray-500 leading-relaxed space-y-2">
            <p>
              Our estimate covers the full research workflow, not just reading time:
              figuring out what&apos;s on your ballot (~15 min to find your sample ballot,
              identify reliable sources, and navigate government portals), reading about
              each race and measure (~7 min per candidate race, ~12 min per ballot measure
              based on{' '}
              <a
                href="https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline decoration-dotted"
              >
                published reading speeds
              </a>
              {' '}and{' '}
              <a
                href="https://ballotpedia.org/Ballot_measure_readability_scores,_2024"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline decoration-dotted"
              >
                typical voter guide lengths
              </a>
              ), plus ~2 min per item weighing your options with no tool to help.
            </p>
            <p>
              The low end assumes you skim quickly and skip some items. The high end
              assumes you read thoroughly. Neither includes the time most people spend
              just trying to figure out where to start.
            </p>
          </div>
        )}
      </div>

      {/* Insight cards */}
      <div className="px-4 py-4 space-y-2.5">
        {INSIGHTS.map((insight, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3"
          >
            <span className="text-lg shrink-0">{insight.emoji}</span>
            <p className="text-[13px] text-gray-600 leading-snug flex-1">
              {insight.text}{' '}
              <a
                href={insight.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block ml-0.5 text-[11px] text-brand-primary underline decoration-dotted hover:text-brand-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                Source
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
