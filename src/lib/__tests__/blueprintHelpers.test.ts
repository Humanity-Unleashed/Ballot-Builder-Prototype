import { describe, it, expect } from 'vitest';
import {
  scoreToPercents,
  getGraduatedLabel,
  getImportanceLabel,
  getAxesForDomains,
  checkForAxisTransition,
  SPECTRUM_BARS,
  STRONG_THRESHOLD,
  MODERATE_THRESHOLD,
} from '../blueprintHelpers';
import type { Spec } from '../../types/civicAssessment';

describe('scoreToPercents', () => {
  it('returns 50/50 for zero score (non-inverted)', () => {
    const result = scoreToPercents(0, false);
    expect(result.leftPct).toBe(50);
    expect(result.rightPct).toBe(50);
  });

  it('returns 0/100 for score 1 (non-inverted)', () => {
    const result = scoreToPercents(1, false);
    expect(result.leftPct).toBe(0);
    expect(result.rightPct).toBe(100);
  });

  it('returns 100/0 for score -1 (non-inverted)', () => {
    const result = scoreToPercents(-1, false);
    expect(result.leftPct).toBe(100);
    expect(result.rightPct).toBe(0);
  });

  it('inverts when invert is true', () => {
    const normal = scoreToPercents(0.5, false);
    const inverted = scoreToPercents(0.5, true);
    expect(normal.leftPct).not.toBe(inverted.leftPct);
  });

  it('left + right always equals 100', () => {
    for (const score of [-1, -0.5, 0, 0.5, 1]) {
      for (const inv of [true, false]) {
        const { leftPct, rightPct } = scoreToPercents(score, inv);
        expect(leftPct + rightPct).toBe(100);
      }
    }
  });
});

describe('getGraduatedLabel', () => {
  const bar = SPECTRUM_BARS[0]; // responsibility_orientation

  it('returns balanced label when both under moderate threshold', () => {
    const result = getGraduatedLabel(52, 48, bar);
    expect(result.label).toBe(bar.balancedLabel);
    expect(result.color).toBe('#6B7280');
  });

  it('returns moderate label when winner is between moderate and strong threshold', () => {
    const result = getGraduatedLabel(65, 35, bar);
    expect(result.label).toBe(bar.leftModerateLabel);
    expect(result.color).toBe(bar.leftColor);
  });

  it('returns strong label when winner is above strong threshold', () => {
    const result = getGraduatedLabel(75, 25, bar);
    expect(result.label).toBe(bar.leftIdLabel);
    expect(result.color).toBe(bar.leftColor);
  });

  it('returns right side labels when right wins', () => {
    const result = getGraduatedLabel(25, 75, bar);
    expect(result.label).toBe(bar.rightIdLabel);
    expect(result.color).toBe(bar.rightColor);
  });
});

describe('getImportanceLabel', () => {
  it('returns "A little" for low values', () => {
    expect(getImportanceLabel(2)).toBe('A little');
    expect(getImportanceLabel(3)).toBe('A little');
  });

  it('returns "Moderately" for mid values', () => {
    expect(getImportanceLabel(4)).toBe('Moderately');
    expect(getImportanceLabel(7)).toBe('Moderately');
  });

  it('returns "Strongly" for high values', () => {
    expect(getImportanceLabel(8)).toBe('Strongly');
    expect(getImportanceLabel(10)).toBe('Strongly');
  });
});

describe('getAxesForDomains', () => {
  const mockSpec = {
    domains: [
      { id: 'econ', name: 'Economy', axes: ['econ_a1', 'econ_a2'] },
      { id: 'health', name: 'Health', axes: ['health_a1'] },
      { id: 'housing', name: 'Housing', axes: ['housing_a1'] },
    ],
  } as unknown as Spec;

  it('returns axes for selected domains', () => {
    const result = getAxesForDomains(mockSpec, new Set(['econ']));
    expect(result).toEqual(['econ_a1', 'econ_a2']);
  });

  it('returns axes from multiple selected domains', () => {
    const result = getAxesForDomains(mockSpec, new Set(['econ', 'health']));
    expect(result).toEqual(['econ_a1', 'econ_a2', 'health_a1']);
  });

  it('returns empty for no selected domains', () => {
    const result = getAxesForDomains(mockSpec, new Set());
    expect(result).toEqual([]);
  });
});

describe('checkForAxisTransition', () => {
  it('returns message at 33%', () => {
    const result = checkForAxisTransition(3, 10);
    expect(result).toContain('Great start');
  });

  it('returns message at 66%', () => {
    const result = checkForAxisTransition(6, 10);
    expect(result).toContain('Almost there');
  });

  it('returns null for other indices', () => {
    expect(checkForAxisTransition(0, 10)).toBeNull();
    expect(checkForAxisTransition(5, 10)).toBeNull();
  });
});

describe('SPECTRUM_BARS', () => {
  it('has 3 bars', () => {
    expect(SPECTRUM_BARS).toHaveLength(3);
  });

  it('each bar has required fields', () => {
    for (const bar of SPECTRUM_BARS) {
      expect(bar.key).toBeTruthy();
      expect(bar.axisName).toBeTruthy();
      expect(bar.leftLabel).toBeTruthy();
      expect(bar.rightLabel).toBeTruthy();
      expect(bar.balancedLabel).toBeTruthy();
    }
  });
});

describe('thresholds', () => {
  it('STRONG_THRESHOLD > MODERATE_THRESHOLD', () => {
    expect(STRONG_THRESHOLD).toBeGreaterThan(MODERATE_THRESHOLD);
  });
});
