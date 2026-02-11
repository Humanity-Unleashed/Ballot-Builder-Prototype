import { describe, it, expect } from 'vitest';
import {
  getValueFraming,
  getUserValueFramings,
  generateValueSummary,
  derivePolicyMetaAlignment,
  VALUE_FRAMING,
} from '../valueFraming';
import type { MetaDimensionScores } from '../archetypes';

describe('getValueFraming', () => {
  it('returns null for neutral score', () => {
    expect(getValueFraming('responsibility_orientation', 0)).toBeNull();
    expect(getValueFraming('responsibility_orientation', 0.1)).toBeNull();
  });

  it('returns negative pole framing for negative score', () => {
    const framing = getValueFraming('responsibility_orientation', -0.5);
    expect(framing).not.toBeNull();
    expect(framing!.pole).toBe('negative');
    expect(framing!.metaDimension).toBe('responsibility_orientation');
  });

  it('returns positive pole framing for positive score', () => {
    const framing = getValueFraming('responsibility_orientation', 0.5);
    expect(framing).not.toBeNull();
    expect(framing!.pole).toBe('positive');
  });

  it('returns correct framing for change_tempo', () => {
    const framing = getValueFraming('change_tempo', -0.5);
    expect(framing).not.toBeNull();
    expect(framing!.metaDimension).toBe('change_tempo');
  });

  it('returns correct framing for governance_style', () => {
    const framing = getValueFraming('governance_style', 0.5);
    expect(framing).not.toBeNull();
    expect(framing!.metaDimension).toBe('governance_style');
  });
});

describe('getUserValueFramings', () => {
  it('returns empty for all-neutral scores', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: 0,
      change_tempo: 0,
      governance_style: 0,
    };
    expect(getUserValueFramings(scores)).toEqual([]);
  });

  it('returns framings for non-neutral dimensions', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: -0.5,
      change_tempo: 0.5,
      governance_style: 0,
    };
    const framings = getUserValueFramings(scores);
    expect(framings).toHaveLength(2);
  });

  it('returns all 3 framings when all dimensions are non-neutral', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: -0.5,
      change_tempo: 0.5,
      governance_style: -0.3,
    };
    const framings = getUserValueFramings(scores);
    expect(framings).toHaveLength(3);
  });
});

describe('generateValueSummary', () => {
  it('returns balanced message for neutral scores', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: 0,
      change_tempo: 0,
      governance_style: 0,
    };
    const summary = generateValueSummary(scores);
    expect(summary).toContain('balanced');
  });

  it('returns single-value summary for one non-neutral dimension', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: -0.5,
      change_tempo: 0,
      governance_style: 0,
    };
    const summary = generateValueSummary(scores);
    expect(summary).toContain('centers on');
  });

  it('returns two-value summary for two non-neutral dimensions', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: -0.5,
      change_tempo: 0.5,
      governance_style: 0,
    };
    const summary = generateValueSummary(scores);
    expect(summary).toContain('and');
  });

  it('returns three-value summary for all non-neutral', () => {
    const scores: MetaDimensionScores = {
      responsibility_orientation: -0.5,
      change_tempo: 0.5,
      governance_style: -0.3,
    };
    const summary = generateValueSummary(scores);
    expect(summary).toContain('weaves together');
  });
});

describe('derivePolicyMetaAlignment', () => {
  it('returns empty for no matching axes', () => {
    const result = derivePolicyMetaAlignment({ unknown_axis: 1 });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('derives alignment from matching axes', () => {
    const result = derivePolicyMetaAlignment({ econ_safetynet: 0.5 });
    expect(result).toHaveProperty('responsibility_orientation');
    // econ_safetynet maps to responsibility_orientation
    // sum = -0.5, count = 1, so result = -0.5
    expect(result.responsibility_orientation).toBe(-0.5);
  });

  it('handles climate_permitting mapping to two dimensions', () => {
    const result = derivePolicyMetaAlignment({ climate_permitting: 1 });
    expect(result).toHaveProperty('change_tempo');
    expect(result).toHaveProperty('governance_style');
  });
});

describe('VALUE_FRAMING data', () => {
  it('has 6 entries (3 dimensions x 2 poles)', () => {
    expect(VALUE_FRAMING).toHaveLength(6);
  });

  it('each entry has required fields', () => {
    for (const vf of VALUE_FRAMING) {
      expect(vf.coreValueLabel).toBeTruthy();
      expect(vf.shortPhrase).toBeTruthy();
      expect(vf.resonanceFraming).toBeTruthy();
      expect(vf.tradeoffFraming).toBeTruthy();
      expect(vf.fragments.youValuePhrase).toBeTruthy();
    }
  });
});
