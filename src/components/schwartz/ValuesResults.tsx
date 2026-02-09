'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SpiderChart from './SpiderChart';
import BoosterBanner from './BoosterBanner';
import BoosterFlow from './BoosterFlow';
import type {
  SchwartzValueScore,
  SchwartzDimensionScore,
  SchwartzSpec,
  SchwartzItemResponse,
  BoosterSetMeta,
  BoosterSet,
} from '@/services/api';
import { schwartzApi } from '@/services/api';
import { useSchwartzStore } from '@/stores/schwartzStore';
import { rawMeanToPercent } from '@/stores/schwartzStore';

interface ValuesResultsProps {
  spec: SchwartzSpec;
  valueScores: SchwartzValueScore[];
  dimensionScores: SchwartzDimensionScore[];
  onRetake: () => void;
}

// Sort values by score (highest first)
function getTopValues(scores: SchwartzValueScore[]): SchwartzValueScore[] {
  return [...scores].sort((a, b) => b.raw_mean - a.raw_mean);
}

// Dimension summaries for generating the civic perspective
const DIMENSION_PHRASES: Record<string, { high: string; chip: string }> = {
  self_transcendence: {
    high: 'caring for others and working toward the common good',
    chip: 'Community-focused',
  },
  conservation: {
    high: 'stability, security, and respecting traditions',
    chip: 'Values stability',
  },
  openness: {
    high: 'new ideas, independence, and personal growth',
    chip: 'Open to change',
  },
  self_enhancement: {
    high: 'achievement, success, and taking initiative',
    chip: 'Results-driven',
  },
};

// Value-specific insights
const VALUE_INSIGHTS: Record<string, string> = {
  universalism: 'You believe in fairness and equal opportunity for all people.',
  benevolence: 'Helping others in your community is important to you.',
  tradition: 'You value customs and time-tested approaches.',
  conformity: 'Following rules and social expectations matters to you.',
  security: 'Safety and stability are priorities in your decision-making.',
  power: 'You value leadership and having influence over outcomes.',
  achievement: 'Personal success and demonstrating competence drive you.',
  hedonism: 'Enjoying life and personal satisfaction matter to you.',
  stimulation: 'You seek variety, novelty, and new experiences.',
  self_direction: 'Independence and freedom to make your own choices are essential.',
};

interface CivicPerspective {
  summary: string;
  chips: string[];
  topValueInsights: string[];
}

function generateCivicPerspective(
  dimensionScores: SchwartzDimensionScore[],
  valueScores: SchwartzValueScore[]
): CivicPerspective {
  // Sort dimensions by score
  const sorted = [...dimensionScores].sort((a, b) => b.raw_mean - a.raw_mean);
  const topDimensions = sorted.filter((d) => d.raw_mean >= 3.0).slice(0, 2);

  // Generate summary phrase
  const phrases = topDimensions
    .map((d) => DIMENSION_PHRASES[d.dimension_id]?.high)
    .filter(Boolean);

  let summary: string;
  if (phrases.length >= 2) {
    summary = `Your civic perspective emphasizes **${phrases[0]}** and **${phrases[1]}**.`;
  } else if (phrases.length === 1) {
    summary = `Your civic perspective emphasizes **${phrases[0]}**.`;
  } else {
    summary = 'Your values reflect a balanced perspective across different priorities.';
  }

  // Generate chips
  const chips = topDimensions
    .map((d) => DIMENSION_PHRASES[d.dimension_id]?.chip)
    .filter(Boolean) as string[];

  // Get top value insights
  const topValues = getTopValues(valueScores).slice(0, 2);
  const topValueInsights = topValues
    .map((v) => VALUE_INSIGHTS[v.value_id])
    .filter(Boolean) as string[];

  return { summary, chips, topValueInsights };
}

// Get dimension color
function getDimensionColor(dimensionId: string): string {
  switch (dimensionId) {
    case 'self_transcendence':
      return 'bg-purple-500';
    case 'self_enhancement':
      return 'bg-orange-500';
    case 'openness':
      return 'bg-blue-500';
    case 'conservation':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getDimensionBgColor(dimensionId: string): string {
  switch (dimensionId) {
    case 'self_transcendence':
      return 'bg-purple-50';
    case 'self_enhancement':
      return 'bg-orange-50';
    case 'openness':
      return 'bg-blue-50';
    case 'conservation':
      return 'bg-green-50';
    default:
      return 'bg-gray-50';
  }
}

function getDimensionTextColor(dimensionId: string): string {
  switch (dimensionId) {
    case 'self_transcendence':
      return 'text-purple-700';
    case 'self_enhancement':
      return 'text-orange-700';
    case 'openness':
      return 'text-blue-700';
    case 'conservation':
      return 'text-green-700';
    default:
      return 'text-gray-700';
  }
}

export default function ValuesResults({
  spec,
  valueScores,
  dimensionScores,
  onRetake,
}: ValuesResultsProps) {
  const router = useRouter();
  const topValues = getTopValues(valueScores).slice(0, 3);
  const sortedDimensions = [...dimensionScores].sort((a, b) => b.raw_mean - a.raw_mean);

  // Generate civic perspective summary
  const perspective = useMemo(
    () => generateCivicPerspective(dimensionScores, valueScores),
    [dimensionScores, valueScores]
  );

  // ── Booster state ──
  const {
    recordBoosterResponses,
    completeBooster,
    dismissBooster,
    reScoreWithBoosters,
    getPendingBoosters,
  } = useSchwartzStore();

  const [pendingBoosters, setPendingBoosters] = useState<BoosterSetMeta[]>([]);
  const [activeBooster, setActiveBooster] = useState<BoosterSet | null>(null);

  // Fetch available boosters on mount
  useEffect(() => {
    let cancelled = false;
    schwartzApi.getBoosters().then((all) => {
      if (cancelled) return;
      const pending = getPendingBoosters(all);
      setPendingBoosters(pending);
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartBooster = useCallback(async (meta: BoosterSetMeta) => {
    try {
      const full = await schwartzApi.getBooster(meta.id);
      setActiveBooster(full);
    } catch {
      console.error('Failed to load booster set');
    }
  }, []);

  const handleCompleteBooster = useCallback(
    async (boosterId: string, responses: SchwartzItemResponse[]) => {
      const booster = activeBooster;
      if (!booster) return;

      recordBoosterResponses(boosterId, responses);
      completeBooster(boosterId, booster.version);
      setActiveBooster(null);
      setPendingBoosters((prev) => prev.filter((b) => b.id !== boosterId));

      // Re-score with all responses merged
      try {
        await reScoreWithBoosters();
      } catch {
        console.error('Failed to re-score after booster');
      }
    },
    [activeBooster, recordBoosterResponses, completeBooster, reScoreWithBoosters],
  );

  const handleDismissBooster = useCallback(
    (boosterId: string) => {
      dismissBooster(boosterId);
      setPendingBoosters((prev) => prev.filter((b) => b.id !== boosterId));
    },
    [dismissBooster],
  );

  const handleCancelBooster = useCallback(() => {
    setActiveBooster(null);
  }, []);

  // Parse markdown-style bold text
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-violet-700 font-semibold">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-violet-600 to-violet-700 px-6 py-8 text-white">
        <h1 className="text-center text-2xl font-bold">Your Civic Blueprint</h1>
        <p className="mt-2 text-center text-violet-100">
          Here&apos;s what matters most to you
        </p>
      </div>

      <div className="mx-auto max-w-lg px-4">
        {/* Booster Flow (inline when active) */}
        {activeBooster && (
          <div className="-mt-4 mb-4">
            <BoosterFlow
              boosterId={activeBooster.id}
              title={activeBooster.title}
              items={activeBooster.items}
              onComplete={handleCompleteBooster}
              onCancel={handleCancelBooster}
            />
          </div>
        )}

        {/* Booster Banner (when pending and not actively answering) */}
        {!activeBooster && pendingBoosters.length > 0 && (
          <div className="-mt-4 mb-4">
            <BoosterBanner
              booster={pendingBoosters[0]}
              onStart={() => handleStartBooster(pendingBoosters[0])}
              onDismiss={() => handleDismissBooster(pendingBoosters[0].id)}
            />
          </div>
        )}

        {/* Civic Perspective Summary Card */}
        <div className={`${!activeBooster && pendingBoosters.length === 0 ? '-mt-4' : ''} rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 p-5 shadow-sm mb-4`}>
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">
            Your Civic Perspective
          </p>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            {renderBoldText(perspective.summary)}
          </p>

          {/* Value chips */}
          {perspective.chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {perspective.chips.map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Top value insights */}
          {perspective.topValueInsights.length > 0 && (
            <div className="mt-4 pt-3 border-t border-violet-200/50 space-y-2">
              {perspective.topValueInsights.map((insight, i) => (
                <p key={i} className="text-[13px] text-gray-600 leading-relaxed flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  {insight}
                </p>
              ))}
            </div>
          )}

          {/* CTA to ballot */}
          <button
            onClick={() => router.push('/ballot')}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition-colors"
          >
            <span>See how this affects your ballot</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Spider Chart */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">
            Your Values Profile
          </p>
          <div className="flex justify-center">
            <SpiderChart valueScores={valueScores} size={300} />
          </div>
        </div>

        {/* Top Values */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Your Top Values
          </h2>
          <div className="space-y-3">
            {topValues.map((value, index) => {
              const specValue = spec.values.find((v) => v.id === value.value_id);
              const percent = rawMeanToPercent(value.raw_mean);

              return (
                <div
                  key={value.value_id}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {value.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {specValue?.description}
                      </p>
                      <div className="mt-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-violet-500 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-xs text-gray-400">
                          {percent}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Higher-Order Dimensions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {sortedDimensions.map((dimension) => {
              const percent = rawMeanToPercent(dimension.raw_mean);
              return (
                <div
                  key={dimension.dimension_id}
                  className={`rounded-xl p-4 ${getDimensionBgColor(dimension.dimension_id)}`}
                >
                  <h3
                    className={`text-sm font-semibold ${getDimensionTextColor(dimension.dimension_id)}`}
                  >
                    {dimension.name}
                  </h3>
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
                      <div
                        className={`h-full rounded-full ${getDimensionColor(dimension.dimension_id)} transition-all`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p
                      className={`mt-1 text-xs ${getDimensionTextColor(dimension.dimension_id)} opacity-70`}
                    >
                      {percent}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Values */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            All Values
          </h2>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {getTopValues(valueScores).map((value) => {
                const percent = rawMeanToPercent(value.raw_mean);
                return (
                  <div key={value.value_id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {value.name}
                      </span>
                      <span className="text-gray-400">{percent}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-violet-400 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Retake button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
