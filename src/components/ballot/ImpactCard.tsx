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

const MINUTES_PER_CANDIDATE_RACE = 7;
const MINUTES_PER_BALLOT_MEASURE = 10;
const SESSION_OVERHEAD = 5;
const CONSERVATIVE_MULTIPLIER = 0.5;

function estimateManualResearchTime(numRaces: number, numMeasures: number) {
  const midpoint =
    numRaces * MINUTES_PER_CANDIDATE_RACE +
    numMeasures * MINUTES_PER_BALLOT_MEASURE +
    SESSION_OVERHEAD;

  const low = Math.round((midpoint * CONSERVATIVE_MULTIPLIER) / 5) * 5; // round to nearest 5
  const high = Math.round(midpoint / 5) * 5;

  return { low: Math.max(low, 5), high: Math.max(high, 10) };
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
        style={{ background: 'linear-gradient(to right, #2B5797, #1E3F6F)' }}
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
              We estimated manual research time based on published data: adults read civic
              content at ~220 words per minute{' '}
              <a
                href="https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline decoration-dotted"
              >
                (Brysbaert&nbsp;2019)
              </a>
              , a typical voter guide entry runs ~600 words per candidate, and ballot measure
              arguments total ~1,500 words each{' '}
              <a
                href="https://ballotpedia.org/Ballot_measure_readability_scores,_2024"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline decoration-dotted"
              >
                (Ballotpedia)
              </a>
              .
            </p>
            <p>
              We assumed a voter reads 2 sources per item and added time for searching
              and navigating between sources. The range reflects a conservative lower
              bound (quick skim) and a midpoint estimate (thorough reading).
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
