import { describe, it, expect } from 'vitest';
import {
  deriveInsightChips,
  getDomainImportanceDescriptor,
  getStanceDescriptor,
  deriveEvidenceData,
} from '../blueprintInsights';
import type { BlueprintProfile } from '../../types/blueprintProfile';
import type { Spec } from '../../types/civicAssessment';

function makeProfile(domains: Array<{
  domain_id: string;
  importance: number;
  axes: Array<{ axis_id: string; value: number }>;
}>): BlueprintProfile {
  return {
    profile_version: '1.0.0',
    user_id: 'test',
    updated_at: new Date().toISOString(),
    domains: domains.map((d) => ({
      domain_id: d.domain_id,
      importance: {
        value_0_10: d.importance,
        source: 'default' as const,
        confidence_0_1: 0.5,
        last_updated_at: new Date().toISOString(),
      },
      axes: d.axes.map((a) => ({
        axis_id: a.axis_id,
        value_0_10: a.value,
        source: 'default' as const,
        confidence_0_1: 0.5,
        locked: false,
        learning_mode: 'normal' as const,
        estimates: { learned_score: 0, learned_value_float: 5 },
        evidence: { n_items_answered: 0, n_unsure: 0, top_driver_item_ids: [] },
      })),
    })),
  };
}

const mockSpec = {
  domains: [
    { id: 'econ', name: 'Economy', axes: ['econ_a1'] },
    { id: 'health', name: 'Healthcare', axes: ['health_a1'] },
  ],
  axes: [
    { id: 'econ_a1', name: 'Safety Net', domain_id: 'econ', poleA: { label: 'More' }, poleB: { label: 'Less' } },
    { id: 'health_a1', name: 'Coverage', domain_id: 'health', poleA: { label: 'Public' }, poleB: { label: 'Private' } },
  ],
} as unknown as Spec;

describe('deriveInsightChips', () => {
  it('returns 3 chips', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 8, axes: [{ axis_id: 'econ_a1', value: 2 }] },
      { domain_id: 'health', importance: 6, axes: [{ axis_id: 'health_a1', value: 5 }] },
    ]);
    const chips = deriveInsightChips({ profile, spec: mockSpec });
    expect(chips).toHaveLength(3);
    expect(chips[0].id).toBe('top_priorities');
    expect(chips[1].id).toBe('strong_lean');
    expect(chips[2].id).toBe('decision_style');
  });

  it('orders top priorities by importance', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 3, axes: [{ axis_id: 'econ_a1', value: 5 }] },
      { domain_id: 'health', importance: 9, axes: [{ axis_id: 'health_a1', value: 5 }] },
    ]);
    const chips = deriveInsightChips({ profile, spec: mockSpec });
    expect(chips[0].label).toContain('Healthcare');
  });

  it('identifies strongest lean axis', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 8, axes: [{ axis_id: 'econ_a1', value: 0 }] },
      { domain_id: 'health', importance: 8, axes: [{ axis_id: 'health_a1', value: 5 }] },
    ]);
    const chips = deriveInsightChips({ profile, spec: mockSpec });
    expect(chips[1].label).toContain('Safety Net');
  });
});

describe('getDomainImportanceDescriptor', () => {
  it('returns importance word with value', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 9, axes: [] },
    ]);
    const result = getDomainImportanceDescriptor(profile, 'econ');
    expect(result).toContain('Top priority');
    expect(result).toContain('9/10');
  });

  it('returns default for missing domain', () => {
    const profile = makeProfile([]);
    const result = getDomainImportanceDescriptor(profile, 'unknown');
    expect(result).toContain('5/10');
  });
});

describe('getStanceDescriptor', () => {
  it('returns Mostly left for low values', () => {
    expect(getStanceDescriptor(1, 'Left', 'Right')).toContain('Mostly');
    expect(getStanceDescriptor(1, 'Left', 'Right')).toContain('Left');
  });

  it('returns Leaning left for values 3-4', () => {
    expect(getStanceDescriptor(4, 'Left', 'Right')).toContain('Leaning');
    expect(getStanceDescriptor(4, 'Left', 'Right')).toContain('Left');
  });

  it('returns Mixed for value 5', () => {
    expect(getStanceDescriptor(5)).toContain('Mixed');
  });

  it('returns Leaning right for values 6-7', () => {
    expect(getStanceDescriptor(7, 'Left', 'Right')).toContain('Leaning');
    expect(getStanceDescriptor(7, 'Left', 'Right')).toContain('Right');
  });

  it('returns Mostly right for high values', () => {
    expect(getStanceDescriptor(9, 'Left', 'Right')).toContain('Mostly');
    expect(getStanceDescriptor(9, 'Left', 'Right')).toContain('Right');
  });

  it('uses default labels when not provided', () => {
    expect(getStanceDescriptor(1)).toContain('Left');
    expect(getStanceDescriptor(9)).toContain('Right');
  });
});

describe('deriveEvidenceData', () => {
  it('returns top domains and top axes', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 8, axes: [{ axis_id: 'econ_a1', value: 1 }] },
      { domain_id: 'health', importance: 6, axes: [{ axis_id: 'health_a1', value: 5 }] },
    ]);
    const result = deriveEvidenceData(profile, mockSpec);
    expect(result.topDomains).toHaveLength(2);
    expect(result.topDomains[0].name).toBe('Economy');
    expect(result.topAxes.length).toBeGreaterThan(0);
  });

  it('ranks axes by distance from midpoint', () => {
    const profile = makeProfile([
      { domain_id: 'econ', importance: 5, axes: [{ axis_id: 'econ_a1', value: 0 }] },
      { domain_id: 'health', importance: 5, axes: [{ axis_id: 'health_a1', value: 4 }] },
    ]);
    const result = deriveEvidenceData(profile, mockSpec);
    expect(result.topAxes[0].name).toBe('Safety Net'); // farthest from 5
  });
});
