import { describe, it, expect } from 'vitest';
import {
  getAxisMetaDimension,
  deriveMetaDimensions,
  computeConfidence,
  computeArchetype,
  getConfidenceLabel,
  META_AXIS_MAP,
  ARCHETYPES,
} from '../archetypes';
import type { BlueprintProfile } from '../../types/blueprintProfile';

function makeProfile(overrides: {
  domains?: Array<{
    domain_id: string;
    importance?: number;
    axes: Array<{ axis_id: string; value?: number; confidence?: number }>;
  }>;
} = {}): BlueprintProfile {
  const domains = (overrides.domains ?? []).map((d) => ({
    domain_id: d.domain_id,
    importance: {
      value_0_10: d.importance ?? 5,
      source: 'default' as const,
      confidence_0_1: 0,
      last_updated_at: new Date().toISOString(),
    },
    axes: d.axes.map((a) => ({
      axis_id: a.axis_id,
      value_0_10: a.value ?? 5,
      source: 'default' as const,
      confidence_0_1: a.confidence ?? 0.5,
      locked: false,
      learning_mode: 'normal' as const,
      estimates: { learned_score: 0, learned_value_float: 5 },
      evidence: { n_items_answered: 0, n_unsure: 0, top_driver_item_ids: [] },
    })),
  }));

  return {
    profile_version: '1.0.0',
    user_id: 'test-user',
    updated_at: new Date().toISOString(),
    domains,
  };
}

describe('getAxisMetaDimension', () => {
  it('returns correct dimensions for a single-dimension axis', () => {
    const dims = getAxisMetaDimension('econ_safetynet');
    expect(dims).toEqual(['responsibility_orientation']);
  });

  it('returns multiple dimensions for climate_permitting', () => {
    const dims = getAxisMetaDimension('climate_permitting');
    expect(dims).toContain('change_tempo');
    expect(dims).toContain('governance_style');
    expect(dims).toHaveLength(2);
  });

  it('returns empty for unknown axis', () => {
    expect(getAxisMetaDimension('nonexistent')).toEqual([]);
  });
});

describe('deriveMetaDimensions', () => {
  it('returns neutral scores for all-neutral profile', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        importance: 5,
        axes: [
          { axis_id: 'econ_safetynet', value: 5 },
          { axis_id: 'econ_investment', value: 5 },
          { axis_id: 'econ_school_choice', value: 5 },
        ],
      }],
    });
    const meta = deriveMetaDimensions(profile);
    expect(meta.responsibility_orientation).toBe(0);
    expect(meta.governance_style).toBe(0);
  });

  it('shifts responsibility_orientation negative for low axis values', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        importance: 10,
        axes: [
          { axis_id: 'econ_safetynet', value: 0 },
          { axis_id: 'econ_investment', value: 0 },
        ],
      }],
    });
    const meta = deriveMetaDimensions(profile);
    // value 0 => stanceToScore = (5-0)/5 = 1 (positive = community-led)
    expect(meta.responsibility_orientation).toBeGreaterThan(0);
  });

  it('returns zero for empty profile', () => {
    const profile = makeProfile({ domains: [] });
    const meta = deriveMetaDimensions(profile);
    expect(meta.responsibility_orientation).toBe(0);
    expect(meta.change_tempo).toBe(0);
    expect(meta.governance_style).toBe(0);
  });
});

describe('computeConfidence', () => {
  it('returns 0.5 for profile with no confidence values', () => {
    const profile = makeProfile({ domains: [] });
    expect(computeConfidence(profile)).toBe(0.5);
  });

  it('averages confidence across axes', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        axes: [
          { axis_id: 'a1', confidence: 0.8 },
          { axis_id: 'a2', confidence: 0.4 },
        ],
      }],
    });
    expect(computeConfidence(profile)).toBeCloseTo(0.6, 5);
  });
});

describe('computeArchetype', () => {
  it('returns a primary archetype', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        importance: 8,
        axes: [
          { axis_id: 'econ_safetynet', value: 0 },
          { axis_id: 'econ_investment', value: 0 },
        ],
      }],
    });
    const result = computeArchetype(profile);
    expect(result.primary).toBeDefined();
    expect(result.primary.id).toBeTruthy();
    expect(result.primary.name).toBeTruthy();
    expect(ARCHETYPES.map((a) => a.id)).toContain(result.primary.id);
  });

  it('returns a secondary archetype', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        importance: 5,
        axes: [{ axis_id: 'econ_safetynet', value: 5 }],
      }],
    });
    const result = computeArchetype(profile);
    expect(result.secondary).toBeDefined();
  });

  it('includes meta dimension scores', () => {
    const profile = makeProfile({
      domains: [{
        domain_id: 'econ',
        axes: [{ axis_id: 'econ_safetynet', value: 3 }],
      }],
    });
    const result = computeArchetype(profile);
    expect(result.meta).toHaveProperty('responsibility_orientation');
    expect(result.meta).toHaveProperty('change_tempo');
    expect(result.meta).toHaveProperty('governance_style');
  });
});

describe('getConfidenceLabel', () => {
  it('returns Low for confidence < 0.35', () => {
    expect(getConfidenceLabel(0.1)).toBe('Confidence: Low');
    expect(getConfidenceLabel(0.34)).toBe('Confidence: Low');
  });

  it('returns Medium for confidence 0.35-0.69', () => {
    expect(getConfidenceLabel(0.35)).toBe('Confidence: Medium');
    expect(getConfidenceLabel(0.69)).toBe('Confidence: Medium');
  });

  it('returns High for confidence >= 0.7', () => {
    expect(getConfidenceLabel(0.7)).toBe('Confidence: High');
    expect(getConfidenceLabel(1.0)).toBe('Confidence: High');
  });
});

describe('META_AXIS_MAP completeness', () => {
  it('has 3 meta-dimensions', () => {
    expect(Object.keys(META_AXIS_MAP)).toHaveLength(3);
  });

  it('has at least 4 axes per dimension', () => {
    for (const axes of Object.values(META_AXIS_MAP)) {
      expect(axes.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('ARCHETYPES', () => {
  it('has 8 archetypes', () => {
    expect(ARCHETYPES).toHaveLength(8);
  });

  it('each archetype has required fields', () => {
    for (const a of ARCHETYPES) {
      expect(a.id).toBeTruthy();
      expect(a.emoji).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.traits.length).toBeGreaterThan(0);
      expect(a.centroid).toHaveProperty('responsibility_orientation');
      expect(a.summary).toBeTruthy();
    }
  });
});
