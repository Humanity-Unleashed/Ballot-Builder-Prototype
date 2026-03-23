'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { getNextElectionDay, daysUntil, formatElectionDate } from '@/lib/electionDate';
import { ballotApi, type BallotLookupResponse } from '@/services/api';
import ElectionBanner from './ElectionBanner';
import { useRouter } from 'next/navigation';
import { RefreshCw, ChevronRight, Share2 } from 'lucide-react';
import ArchetypeShareCard from './ArchetypeShareCard';
import type { BlueprintProfile } from '@/types/blueprintProfile';
import type { Spec } from '@/types/civicAssessment';
import {
  DOMAIN_DISPLAY_NAMES,
  getDomainEmoji,
  getDomainSummary,
} from '@/lib/blueprintHelpers';
import {
  computeArchetype,
  type ArchetypeResult,
  type ArchetypeVariant,
  getArchetypeVariant,
  getArchetypeDisplayName,
  getArchetypeDisplayEmoji,
  getArchetypeDisplaySummary,
} from '@/lib/archetypes';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { useDemographicStore } from '@/stores/demographicStore';
import DomainLeanMeter from './DomainLeanMeter';

// ─── Props ────────────────────────────────────────────────

interface BlueprintSummaryViewProps {
  profile: BlueprintProfile;
  spec: Spec;
  /** @deprecated No longer used — archetype computed internally from profile */
  metaDimensions?: unknown;
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
  fineTuningResponses,
  onRetake,
  onFineTune,
  onChangeAxis,
  hideCta = false,
}: BlueprintSummaryViewProps) {
  const router = useRouter();
  const { track } = useAnalyticsContext();
  const demographicProfile = useDemographicStore((s) => s.profile);
  const [showShareCard, setShowShareCard] = useState(false);
  const [confirmation, setConfirmation] = useState<'none' | 'confirmed' | 'off'>('none');
  const [abVariant] = useState<ArchetypeVariant>(() => getArchetypeVariant());
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

  // ── Archetype ──
  const archetype: ArchetypeResult = useMemo(() => computeArchetype(profile), [profile]);

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
        {/* ── Title ── */}
        <div className="mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Your Civic Blueprint</h1>
        </div>
        <p className="mb-5 text-[13px] leading-[1.4] text-gray-500">
          Here&apos;s where your values place you on key policy questions.
        </p>

        {/* ── Election banner ── */}
        <ElectionBanner daysUntilElection={daysRemaining} electionLabel={electionLabel} voterInfo={voterInfo} location={location} />

        {/* ── Archetype card ── */}
        <div className="mb-4 rounded-[14px] border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            {getArchetypeDisplayEmoji(archetype.primary, abVariant) && (
              <span className="text-3xl leading-none mt-0.5">{getArchetypeDisplayEmoji(archetype.primary, abVariant)}</span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-gray-900">{getArchetypeDisplayName(archetype.primary, abVariant)}</h2>
                <button
                  onClick={() => {
                    track('click', { element: 'share_archetype_toggle', variant: abVariant });
                    setShowShareCard(!showShareCard);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </button>
              </div>
              <p className="text-[13px] leading-[1.45] text-gray-500 mt-1">
                {getArchetypeDisplaySummary(archetype.primary, abVariant)}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {archetype.primary.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600"
                  >
                    {trait}
                  </span>
                ))}
              </div>
              {archetype.secondary && archetype.margin < 0.3 && (
                <p className="text-[11px] text-gray-400 mt-2.5">
                  Also close to <span className="font-semibold">{getArchetypeDisplayEmoji(archetype.secondary, abVariant)} {getArchetypeDisplayName(archetype.secondary, abVariant)}</span>
                </p>
              )}
            </div>
          </div>

          {showShareCard && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <ArchetypeShareCard archetype={archetype} onClose={() => setShowShareCard(false)} />
            </div>
          )}
        </div>

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

                {/* Domain summary sentence */}
                {profileDomain && (
                  <p className="text-[12px] leading-[1.5] text-gray-500 mb-3">
                    {getDomainSummary(
                      specDomain.id,
                      specDomain.axes.map((axisId) => ({
                        axisId,
                        value: profileDomain.axes.find((a) => a.axis_id === axisId)?.value_0_10 ?? 5,
                      })),
                    )}
                  </p>
                )}

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

        {/* ── Confirmation section ── */}
        <div className="mt-5 rounded-[14px] border border-gray-200 bg-white px-4 py-5 shadow-sm">
          {confirmation === 'none' && (
            <>
              <h3 className="text-[15px] font-bold text-gray-900 mb-1">Does this feel like you?</h3>
              <p className="text-[12px] text-gray-500 leading-[1.5] mb-4">
                Your positions above are what we&apos;ll use to match you with candidates and ballot measures.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    track('click', { element: 'profile_confirmed' });
                    setConfirmation('confirmed');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border-default bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-lg">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Yes, this feels right</p>
                    <p className="text-[11px] text-gray-400">Continue to build your ballot</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    track('click', { element: 'profile_something_off' });
                    setConfirmation('off');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border-default bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-lg">✎</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Something&apos;s off</p>
                    <p className="text-[11px] text-gray-400">Review and adjust specific areas</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {confirmation === 'confirmed' && (
            <div className="text-center animate-fade-in-up">
              <span className="text-2xl">✓</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">Great, you&apos;re all set.</p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                We&apos;ll use these positions to find your best matches.
              </p>
            </div>
          )}

          {confirmation === 'off' && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-semibold text-gray-900 mb-1">Which area feels off?</p>
              <p className="text-[12px] text-gray-500 leading-[1.5] mb-3">
                Tap a domain to scroll up and adjust your positions. Your civic style will update automatically.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {sortedDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      track('click', { element: 'review_domain', domainId: d.id });
                      handleFineTune(d.id);
                      setConfirmation('none');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-default bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-colors"
                  >
                    <span className="text-sm">{getDomainEmoji(d.id)}</span>
                    <span className="text-xs font-semibold text-gray-700">{DOMAIN_DISPLAY_NAMES[d.id] ?? d.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setConfirmation('none')}
                  className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => { track('click', { element: 'retake_blueprint' }); onRetake(); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Start over from scratch
                </button>
              </div>
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
