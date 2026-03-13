'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { getNextElectionDay, daysUntil, formatElectionDate } from '@/lib/electionDate';
import { ballotApi, type BallotLookupResponse } from '@/services/api';
import ElectionBanner from './ElectionBanner';
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
  /** Hide the floating "Build my ballot" CTA (wizard provides its own) */
  hideCta?: boolean;
}

export default function BlueprintSummaryView({
  profile,
  spec,
  metaDimensions,
  fineTuningResponses,
  onRetake,
  onFineTune,
  onChangeAxis,
  hideCta = false,
}: BlueprintSummaryViewProps) {
  const router = useRouter();
  const { track } = useAnalyticsContext();
  const demographicProfile = useDemographicStore((s) => s.profile);
  const demographicChips = useMemo(() => getDemographicChips(demographicProfile), [demographicProfile]);

  // ── Election date ──
  const { electionLabel, daysRemaining } = useMemo(() => {
    const electionDay = getNextElectionDay();
    return {
      electionLabel: `Election Day — ${formatElectionDate(electionDay)}`,
      daysRemaining: daysUntil(electionDay),
    };
  }, []);

  // ── Voter info (fetched via zipcode for real URLs + deadlines) ──
  const zipCode = demographicProfile.zipCode;
  const [voterInfo, setVoterInfo] = useState<BallotLookupResponse['voterInfo'] | null>(null);
  const [location, setLocation] = useState<BallotLookupResponse['location'] | null>(null);

  useEffect(() => {
    if (!zipCode || zipCode.length !== 5) return;
    let cancelled = false;
    ballotApi.getByZipcode(zipCode).then((result) => {
      if (!cancelled) {
        setVoterInfo(result.voterInfo ?? null);
        setLocation(result.location ?? null);
      }
    }).catch(() => { /* voter info is optional */ });
    return () => { cancelled = true; };
  }, [zipCode]);

  // ── Derived data ──
  const valueSummary = useMemo(() => {
    return metaDimensions ? generateValueSummary(metaDimensions) : null;
  }, [metaDimensions]);

  // ── Sort domains by average axis importance (highest first) ──
  const sortedDomains = useMemo(() => {
    return [...spec.domains].sort((a, b) => {
      const aDomain = profile.domains.find((d) => d.domain_id === a.id);
      const bDomain = profile.domains.find((d) => d.domain_id === b.id);
      const avgImportance = (dp: typeof aDomain) =>
        dp ? dp.axes.reduce((sum, ax) => sum + (ax.importance ?? 5), 0) / dp.axes.length : 5;
      return avgImportance(bDomain) - avgImportance(aDomain);
    });
  }, [spec.domains, profile.domains]);

  // ── Handlers ──

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
          <h1 className="text-xl font-extrabold text-gray-900">Your Civic Blueprint</h1>
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

        {/* ── Election banner ── */}
        <ElectionBanner daysUntilElection={daysRemaining} electionLabel={electionLabel} voterInfo={voterInfo} location={location} />

        {/* ── Values context card ── */}
        {metaDimensions && valueSummary && (
          <div className="mb-4 rounded-[14px] border border-border-default bg-brand-primary-light px-4 py-3.5">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-brand-primary">
              What drives your positions
            </div>
            <div className="text-[13px] leading-5 text-gray-600">
              {valueSummary}
            </div>
          </div>
        )}

        {/* ── Domain cards (vertical stack, sorted by importance) ── */}
        <div className="flex flex-col gap-3">
          {sortedDomains.map((specDomain) => {
            const profileDomain = profile.domains.find((d) => d.domain_id === specDomain.id);
            const emoji = getDomainEmoji(specDomain.id);
            const displayName = DOMAIN_DISPLAY_NAMES[specDomain.id] ?? specDomain.name;
            const hasFT = domainHasFineTuning(specDomain.id);

            return (
              <div
                key={specDomain.id}
                className="rounded-[14px] border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
              >
                {/* Header: icon + domain name + fine-tune */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{emoji}</span>
                    <span className="text-xs font-bold text-gray-700">{displayName}</span>
                  </div>
                  <button
                    onClick={() => { track('click', { element: 'fine_tune', domainId: specDomain.id }); handleFineTune(specDomain.id); }}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-primary transition-colors hover:text-brand-primary/80"
                  >
                    {hasFT ? 'Fine-tuned' : 'Fine-tune'}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Per-axis compact meters */}
                <div className="flex flex-col gap-2">
                  {specDomain.axes.map((axisId) => {
                    const axisDef = spec.axes.find((a) => a.id === axisId);
                    const axisProfile = profileDomain?.axes.find((a) => a.axis_id === axisId);
                    if (!axisDef) return null;

                    const value010 = axisProfile?.value_0_10 ?? 5;
                    const position = Math.round((value010 / 10) * 100);

                    return (
                      <div key={axisId}>
                        <div className="mb-0.5 text-[10px] font-semibold text-gray-500">
                          {axisDef.name}
                        </div>
                        <DomainLeanMeter
                          compact
                          value={position}
                          leftLabel={axisDef.poleA.label}
                          rightLabel={axisDef.poleB.label}
                          onChange={(v) => {
                            const newValue010 = Math.round((v / 100) * 10);
                            onChangeAxis(axisId, newValue010);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Underlying values footer — hidden for now (data still computed for scoring) ── */}

        {/* ── Bridge card ── */}
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-100 p-5">
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-emerald-600">
            How we build your ballot
          </div>

          {/* Diagram: Blueprint + Profile → Ballot */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <div className="flex-1 rounded-[10px] border border-border-default bg-brand-primary-light px-3 py-2.5 text-center">
              <span className="mb-1 block text-lg">📋</span>
              <span className="text-[11px] font-bold text-gray-700">Your blueprint</span>
            </div>
            <span className="text-base font-extrabold text-gray-300">+</span>
            <div className="flex-1 rounded-[10px] border border-brand-primary-light bg-brand-primary-surface px-3 py-2.5 text-center">
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

        {/* Spacer for floating CTA */}
        <div className="h-20" />
      </div>

      {/* ── Floating CTA button (hidden in wizard mode) ── */}
      {!hideCta && (
        <div className="fixed bottom-6 left-0 right-0 z-40 mx-auto max-w-lg px-4">
          <button
            onClick={() => { track('click', { element: 'build_ballot' }); router.push('/ballot'); }}
            className="w-full rounded-[14px] bg-brand-primary py-4 text-[15px] font-bold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Build my ballot &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
