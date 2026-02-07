/**
 * Blueprint Insights
 *
 * Derives insight chips and evidence data from the user's profile.
 */

import type { BlueprintProfile, AxisProfile } from '../types/blueprintProfile';
import type { Spec } from '../types/civicAssessment';

export interface InsightChipData {
  id: 'top_priorities' | 'strong_lean' | 'decision_style';
  label: string;
  domain_id?: string;
  axis_id?: string;
}

function getImportanceWord(v: number): string {
  if (v <= 0) return 'Not a priority';
  if (v <= 2) return 'Low';
  if (v <= 4) return 'Minor';
  if (v <= 6) return 'Important';
  if (v <= 8) return 'Very important';
  return 'Top priority';
}

/**
 * Derive insight chips from profile
 */
export function deriveInsightChips(params: {
  profile: BlueprintProfile;
  spec?: Spec;
  archetypeTraitsShort?: string;
}): InsightChipData[] {
  const { profile, spec, archetypeTraitsShort } = params;

  const domainDefsById = new Map((spec?.domains ?? []).map(d => [d.id, d]));
  const axisDefsById = new Map((spec?.axes ?? []).map(a => [a.id, a]));

  // Sort domains by importance
  const domainsSorted = [...profile.domains].sort(
    (a, b) => (b.importance.value_0_10 ?? 5) - (a.importance.value_0_10 ?? 5)
  );
  const top2 = domainsSorted.slice(0, 2);
  const dA = domainDefsById.get(top2[0]?.domain_id ?? '')?.name ?? top2[0]?.domain_id ?? '—';
  const dB = domainDefsById.get(top2[1]?.domain_id ?? '')?.name ?? top2[1]?.domain_id ?? '—';

  // Strong lean: among high-importance domains (>=6), find axis farthest from midpoint
  let bestAxis: { axis_id: string; domain_id: string; dist: number } | null = null;
  for (const d of profile.domains) {
    const imp = d.importance.value_0_10 ?? 5;
    if (imp < 6) continue;
    for (const a of d.axes) {
      const dist = Math.abs((a.value_0_10 ?? 5) - 5);
      if (!bestAxis || dist > bestAxis.dist) {
        bestAxis = { axis_id: a.axis_id, domain_id: d.domain_id, dist };
      }
    }
  }
  const axisName = bestAxis
    ? (axisDefsById.get(bestAxis.axis_id)?.name ?? bestAxis.axis_id)
    : '—';

  const chips: InsightChipData[] = [
    { id: 'top_priorities', label: `Top priorities: ${dA}, ${dB}`, domain_id: top2[0]?.domain_id },
    { id: 'strong_lean', label: `Strong lean: ${axisName}`, domain_id: bestAxis?.domain_id, axis_id: bestAxis?.axis_id },
    { id: 'decision_style', label: `Style: ${archetypeTraitsShort ?? '—'}` }
  ];

  return chips;
}

/**
 * Get domain importance descriptor
 */
export function getDomainImportanceDescriptor(profile: BlueprintProfile, domain_id: string): string {
  const d = profile.domains.find(x => x.domain_id === domain_id);
  const v = d?.importance.value_0_10 ?? 5;
  return `${getImportanceWord(v)} (${v}/10)`;
}

/**
 * Get stance descriptor for an axis value
 */
export function getStanceDescriptor(value: number, leftLabel?: string, rightLabel?: string): string {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  if (v <= 2) return `Mostly: ${leftLabel ?? 'Left'}`;
  if (v <= 4) return `Leaning: ${leftLabel ?? 'Left'}`;
  if (v === 5) return 'Mixed / depends';
  if (v <= 7) return `Leaning: ${rightLabel ?? 'Right'}`;
  return `Mostly: ${rightLabel ?? 'Right'}`;
}

export interface EvidenceData {
  topDomains: Array<{ name: string; importanceLabel: string }>;
  topAxes: Array<{ name: string; stanceLabel: string }>;
  driverItems?: string[];
}

/**
 * Derive evidence data for the evidence modal
 */
export function deriveEvidenceData(profile: BlueprintProfile, spec?: Spec): EvidenceData {
  // Top domains by importance
  const topDomains = [...profile.domains]
    .sort((a, b) => (b.importance.value_0_10 ?? 5) - (a.importance.value_0_10 ?? 5))
    .slice(0, 2)
    .map((d) => ({
      name: spec?.domains.find(x => x.id === d.domain_id)?.name ?? d.domain_id,
      importanceLabel: getDomainImportanceDescriptor(profile, d.domain_id)
    }));

  // Top axes by distance from midpoint (strongest stances)
  const topAxes = profile.domains.flatMap(d => d.axes.map(a => ({ d, a })))
    .sort((x, y) => Math.abs((y.a.value_0_10 ?? 5) - 5) - Math.abs((x.a.value_0_10 ?? 5) - 5))
    .slice(0, 2)
    .map(({ a }) => {
      const def = spec?.axes.find(x => x.id === a.axis_id);
      const name = def?.name ?? a.axis_id;
      const stanceLabel = getStanceDescriptor(a.value_0_10 ?? 5, def?.poleA.label, def?.poleB.label);
      return { name, stanceLabel };
    });

  return { topDomains, topAxes };
}
