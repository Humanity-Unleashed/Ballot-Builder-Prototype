'use client';

import type { BallotItem } from '@/lib/ballotHelpers';

interface ImpactCardProps {
  ballotItems: BallotItem[];
  sessionMinutes?: number;
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
  const races = ballotItems.filter((i) => i.type === 'candidate_race').length;
  const measures = ballotItems.filter((i) => i.type === 'proposition').length;

  return (
    <div className="mx-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
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
          {sessionMinutes != null && sessionMinutes >= 0 && (
            <>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-extrabold">{sessionMinutes < 1 ? '<1' : sessionMinutes}</p>
                <p className="text-[11px] text-white/70">minutes</p>
              </div>
            </>
          )}
        </div>
        {sessionMinutes != null && sessionMinutes > 0 && (
          <p className="text-white/80 text-[13px] mt-3 pt-3 border-t border-white/20">
            You prepped your entire ballot in {sessionMinutes} minute{sessionMinutes !== 1 ? 's' : ''} — under {Math.ceil((sessionMinutes || 1) / Math.max(races + measures, 1))} minute{Math.ceil((sessionMinutes || 1) / Math.max(races + measures, 1)) !== 1 ? 's' : ''} per item, with evidence for each.
          </p>
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
