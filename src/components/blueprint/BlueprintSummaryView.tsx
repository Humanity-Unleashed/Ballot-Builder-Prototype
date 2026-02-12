'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ChevronRight } from 'lucide-react';
import type { BlueprintProfile } from '@/types/blueprintProfile';
import type { Spec } from '@/types/civicAssessment';
import type { MetaDimensionScores } from '@/lib/archetypes';
import { generateValueSummary } from '@/lib/valueFraming';
import {
  DOMAIN_DISPLAY_NAMES,
  getDomainEmoji,
} from '@/lib/blueprintHelpers';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { useDemographicStore } from '@/stores/demographicStore';
import type { DemographicProfile } from '@/stores/demographicStore';
import DomainLeanMeter from './DomainLeanMeter';

// ─── Demographic chip helpers ────────────────────────────

const AGE_LABELS: Record<string, string> = {
  '18_24': '18–24', '25_34': '25–34', '35_44': '35–44',
  '45_54': '45–54', '55_64': '55–64', '65_plus': '65+',
};
const INCOME_LABELS: Record<string, string> = {
  'under_25k': 'Under $25k', '25k_50k': '$25k–50k', '50k_75k': '$50k–75k',
  '75k_100k': '$75k–100k', '100k_150k': '$100k–150k', '150k_200k': '$150k–200k',
  'over_200k': '$200k+',
};
const HOUSING_LABELS: Record<string, string> = {
  'own_home': 'Homeowner', 'rent': 'Renter', 'live_with_family': 'Living with family',
  'unhoused': 'Unhoused', 'other': 'Other housing',
};
const EMPLOYMENT_LABELS: Record<string, string> = {
  'full_time': 'Full-time', 'part_time': 'Part-time', 'self_employed': 'Self-employed',
  'unemployed': 'Unemployed', 'student': 'Student', 'retired': 'Retired',
  'homemaker': 'Homemaker', 'other': 'Other employment',
};

function getDemographicChips(profile: DemographicProfile): string[] {
  const chips: string[] = [];
  if (profile.ageRange && profile.ageRange in AGE_LABELS) chips.push(AGE_LABELS[profile.ageRange]);
  if (profile.householdIncome && profile.householdIncome in INCOME_LABELS) chips.push(INCOME_LABELS[profile.householdIncome]);
  if (profile.housingSituation && profile.housingSituation in HOUSING_LABELS) chips.push(HOUSING_LABELS[profile.housingSituation]);
  if (profile.employmentType && profile.employmentType in EMPLOYMENT_LABELS) chips.push(EMPLOYMENT_LABELS[profile.employmentType]);
  return chips;
}

// ─── Domain config for V3 cards ───────────────────────────

interface DomainCardConfig {
  domainId: string;
  leftPole: string;
  rightPole: string;
  leftStatement: string;
  rightStatement: string;
  balancedStatement: string;
}

const DOMAIN_CARD_CONFIGS: DomainCardConfig[] = [
  {
    domainId: 'econ',
    leftPole: 'Safety nets',
    rightPole: 'Lower taxes',
    leftStatement: "You'd invest in safety nets — with accountability built in.",
    rightStatement: "You'd rely on markets and reward individual effort.",
    balancedStatement: "You balance social support with economic freedom.",
  },
  {
    domainId: 'housing',
    leftPole: 'Protections',
    rightPole: 'Market freedom',
    leftStatement: "You'd protect renters before deregulating the market.",
    rightStatement: "You'd let the market set prices and expand supply.",
    balancedStatement: "You'd mix tenant protections with market incentives.",
  },
  {
    domainId: 'health',
    leftPole: 'Public option',
    rightPole: 'Private market',
    leftStatement: "You'd expand public coverage — phased in, evidence-based.",
    rightStatement: "You'd let people choose coverage in a competitive market.",
    balancedStatement: "You'd blend public coverage with private options.",
  },
  {
    domainId: 'climate',
    leftPole: 'Regulation',
    rightPole: 'Market-led',
    leftStatement: "You'd regulate based on science, not urgency alone.",
    rightStatement: "You'd incentivize innovation rather than mandate compliance.",
    balancedStatement: "You'd pair smart regulation with market incentives.",
  },
  {
    domainId: 'justice',
    leftPole: 'Reform',
    rightPole: 'Status quo',
    leftStatement: "You'd reform institutions from within, not dismantle them.",
    rightStatement: "You'd maintain tested systems that keep society stable.",
    balancedStatement: "You'd make targeted reforms while preserving what works.",
  },
];

// ─── Helpers ──────────────────────────────────────────────

/** Compute domain average position (0-100, where 0 = poleA, 100 = poleB) */
function computeDomainPosition(
  profile: BlueprintProfile,
  domainId: string,
): number {
  const domain = profile.domains.find((d) => d.domain_id === domainId);
  if (!domain || domain.axes.length === 0) return 50;
  const avg =
    domain.axes.reduce((sum, a) => sum + a.value_0_10, 0) / domain.axes.length;
  return Math.round((avg / 10) * 100);
}

/** Pick the appropriate statement based on position */
function getDomainStatement(config: DomainCardConfig, position: number): string {
  if (position <= 35) return config.leftStatement;
  if (position >= 65) return config.rightStatement;
  return config.balancedStatement;
}

// ─── Props ────────────────────────────────────────────────

interface BlueprintSummaryViewProps {
  profile: BlueprintProfile;
  spec: Spec;
  metaDimensions: MetaDimensionScores | null;
  fineTuningResponses: Record<string, Record<string, number>>;
  onRetake: () => void;
  onFineTune: (axisId: string) => void;
  onChangeAxis: (axisId: string, value: number) => void;
  onChangeAxisImportance: (axisId: string, value: number) => void;
}

export default function BlueprintSummaryView({
  profile,
  spec,
  metaDimensions,
  fineTuningResponses,
  onRetake,
  onFineTune,
  onChangeAxis,
}: BlueprintSummaryViewProps) {
  const router = useRouter();
  const { track } = useAnalyticsContext();
  const demographicProfile = useDemographicStore((s) => s.profile);
  const demographicChips = useMemo(() => getDemographicChips(demographicProfile), [demographicProfile]);

  // ── Derived data ──
  const valueSummary = useMemo(() => {
    return metaDimensions ? generateValueSummary(metaDimensions) : null;
  }, [metaDimensions]);

  /** Compute position per domain: { domainId: 0-100 } */
  const domainPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    for (const config of DOMAIN_CARD_CONFIGS) {
      positions[config.domainId] = computeDomainPosition(profile, config.domainId);
    }
    return positions;
  }, [profile]);

  // ── Handlers ──

  /** When user drags a domain lean meter, shift all axes in that domain proportionally */
  const handleDomainChange = (domainId: string, newPosition: number) => {
    const domain = profile.domains.find((d) => d.domain_id === domainId);
    if (!domain || domain.axes.length === 0) return;

    const currentAvg =
      domain.axes.reduce((sum, a) => sum + a.value_0_10, 0) / domain.axes.length;
    const newAvg = (newPosition / 100) * 10;
    const delta = newAvg - currentAvg;

    for (const axis of domain.axes) {
      const newValue = Math.max(0, Math.min(10, Math.round(axis.value_0_10 + delta)));
      onChangeAxis(axis.axis_id, newValue);
    }
  };

  /** Fine-tune: pass first axis of the domain */
  const handleFineTune = (domainId: string) => {
    const specDomain = spec.domains.find((d) => d.id === domainId);
    if (specDomain && specDomain.axes.length > 0) {
      onFineTune(specDomain.axes[0]);
    }
  };

  /** Check if any axis in a domain has fine-tuning data */
  const domainHasFineTuning = (domainId: string): boolean => {
    const specDomain = spec.domains.find((d) => d.id === domainId);
    if (!specDomain) return false;
    return specDomain.axes.some((axisId) => !!fineTuningResponses[axisId]);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="overflow-y-auto px-4 pt-4 pb-10">
        {/* ── Title + Retake ── */}
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-900">Your Civic Priorities</h1>
          <button
            onClick={() => { track('click', { element: 'retake_blueprint' }); onRetake(); }}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-600">Retake</span>
          </button>
        </div>
        <p className="mb-5 text-[13px] leading-[1.4] text-gray-500">
          Here&apos;s where your values place you on key policy questions.
        </p>

        {/* ── Values context card ── */}
        {metaDimensions && valueSummary && (
          <div className="mb-4 rounded-[14px] border border-[#e0d4fc] bg-[#f3f0ff] px-4 py-3.5">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-violet-600">
              What drives your positions
            </div>
            <div className="text-[13px] leading-5 text-gray-600">
              {valueSummary}
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.2px] text-gray-700">
          Your policy leanings
        </div>

        {/* ── Domain cards ── */}
        {DOMAIN_CARD_CONFIGS.map((config) => {
          const position = domainPositions[config.domainId] ?? 50;
          const statement = getDomainStatement(config, position);
          const emoji = getDomainEmoji(config.domainId);
          const displayName = DOMAIN_DISPLAY_NAMES[config.domainId] ?? config.domainId;
          const hasFT = domainHasFineTuning(config.domainId);

          return (
            <div
              key={config.domainId}
              className="mb-2.5 rounded-[14px] border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
            >
              {/* Header: icon + domain name + fine-tune */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-bold text-gray-700">{displayName}</span>
                </div>
                <button
                  onClick={() => { track('click', { element: 'fine_tune', domainId: config.domainId }); handleFineTune(config.domainId); }}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-violet-500 transition-colors hover:text-violet-700"
                >
                  {hasFT ? 'Fine-tuned' : 'Fine-tune'}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Bold statement */}
              <div className="mb-3 text-sm font-semibold leading-5 text-gray-900">
                {statement}
              </div>

              {/* Lean meter */}
              <DomainLeanMeter
                value={position}
                leftLabel={config.leftPole}
                rightLabel={config.rightPole}
                onChange={(v) => handleDomainChange(config.domainId, v)}
              />
            </div>
          );
        })}

        {/* ── Underlying values footer — hidden for now (data still computed for scoring) ── */}

        {/* ── Bridge card ── */}
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-100 p-5">
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-emerald-600">
            How we build your ballot
          </div>

          {/* Diagram: Blueprint + Profile → Ballot */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <div className="flex-1 rounded-[10px] border border-violet-200 bg-violet-50 px-3 py-2.5 text-center">
              <span className="mb-1 block text-lg">📋</span>
              <span className="text-[11px] font-bold text-gray-700">Your blueprint</span>
            </div>
            <span className="text-base font-extrabold text-gray-300">+</span>
            <div className="flex-1 rounded-[10px] border border-blue-200 bg-blue-50 px-3 py-2.5 text-center">
              <span className="mb-1 block text-lg">👤</span>
              <span className="text-[11px] font-bold text-gray-700">Your profile</span>
            </div>
          </div>

          <div className="text-[13px] leading-5 text-gray-700">
            We&apos;ll match your civic priorities to{' '}
            <strong className="font-semibold text-emerald-800">what&apos;s actually on your ballot</strong>,
            then check how each measure would impact{' '}
            <strong className="font-semibold text-emerald-800">someone in your situation</strong>:
          </div>

          {demographicChips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {demographicChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA button ── */}
        <button
          onClick={() => { track('click', { element: 'build_ballot' }); router.push('/ballot'); }}
          className="mb-3 w-full rounded-[14px] bg-violet-600 py-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Build my ballot &rarr;
        </button>
      </div>
    </div>
  );
}
