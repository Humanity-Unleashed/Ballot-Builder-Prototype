import { describe, it, expect } from 'vitest';
import {
  valueToPositionIndex,
  positionIndexToValue,
  getStanceLabel,
  getSliderThumbColor,
  computePropositionRecommendation,
  computeCandidateMatches,
  DEFAULT_CATEGORIES,
  type ValueAxis,
  type BallotItem,
} from '../ballotHelpers';

describe('valueToPositionIndex', () => {
  it('maps 0 to first position', () => {
    expect(valueToPositionIndex(0, 5)).toBe(0);
  });

  it('maps 10 to last position', () => {
    expect(valueToPositionIndex(10, 5)).toBe(4);
  });

  it('maps 5 to middle position', () => {
    expect(valueToPositionIndex(5, 5)).toBe(2);
  });

  it('rounds to nearest position', () => {
    expect(valueToPositionIndex(3, 5)).toBe(1);
  });
});

describe('positionIndexToValue', () => {
  it('maps first position to 0', () => {
    expect(positionIndexToValue(0, 5)).toBe(0);
  });

  it('maps last position to 10', () => {
    expect(positionIndexToValue(4, 5)).toBe(10);
  });

  it('maps middle position to 5', () => {
    expect(positionIndexToValue(2, 5)).toBe(5);
  });
});

describe('getStanceLabel', () => {
  it('returns strongly toward poleA for low values', () => {
    expect(getStanceLabel(0, 'Left', 'Right')).toContain('Left');
    expect(getStanceLabel(1, 'Left', 'Right')).toContain('Strongly');
  });

  it('returns lean toward poleA for values 3-4', () => {
    expect(getStanceLabel(3, 'Left', 'Right')).toContain('Lean');
    expect(getStanceLabel(3, 'Left', 'Right')).toContain('Left');
  });

  it('returns balanced for value 5', () => {
    expect(getStanceLabel(5, 'Left', 'Right')).toContain('Balanced');
  });

  it('returns lean toward poleB for values 6-7', () => {
    expect(getStanceLabel(7, 'Left', 'Right')).toContain('Lean');
    expect(getStanceLabel(7, 'Left', 'Right')).toContain('Right');
  });

  it('returns strongly toward poleB for high values', () => {
    expect(getStanceLabel(9, 'Left', 'Right')).toContain('Right');
    expect(getStanceLabel(9, 'Left', 'Right')).toContain('Strongly');
  });
});

describe('getSliderThumbColor', () => {
  it('returns purple for left positions', () => {
    expect(getSliderThumbColor(0, 5)).toBe('#8B7AAF');
  });

  it('returns teal for right positions', () => {
    expect(getSliderThumbColor(4, 5)).toBe('#5B9E94');
  });

  it('returns gray for middle positions', () => {
    expect(getSliderThumbColor(2, 5)).toBe('#6B7280');
  });
});

describe('computePropositionRecommendation', () => {
  const userAxes: ValueAxis[] = [
    { id: 'axis1', name: 'Safety Net', description: '', value: 2, poleA: 'More', poleB: 'Less', weight: 1 },
    { id: 'axis2', name: 'Investment', description: '', value: 8, poleA: 'Public', poleB: 'Private', weight: 1 },
  ];

  it('returns null vote for non-proposition items', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'contests', type: 'candidate_race',
      title: 'Race', questionText: '', explanation: '',
    };
    const result = computePropositionRecommendation(item, userAxes);
    expect(result.vote).toBeNull();
  });

  it('returns a recommendation for a proposition with effects', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'measures', type: 'proposition',
      title: 'Prop A', questionText: '', explanation: '',
      relevantAxes: ['axis1', 'axis2'],
      yesAxisEffects: { axis1: -1, axis2: 0.5 },
    };
    const result = computePropositionRecommendation(item, userAxes);
    expect(result.breakdown.length).toBeGreaterThan(0);
    expect(typeof result.confidence).toBe('number');
  });

  it('returns null vote when no relevant user axes match', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'measures', type: 'proposition',
      title: 'Prop A', questionText: '', explanation: '',
      relevantAxes: ['nonexistent'],
      yesAxisEffects: { nonexistent: 1 },
    };
    const result = computePropositionRecommendation(item, userAxes);
    expect(result.vote).toBeNull();
  });
});

describe('computeCandidateMatches', () => {
  const userAxes: ValueAxis[] = [
    { id: 'axis1', name: 'Axis 1', description: '', value: 3, poleA: 'A', poleB: 'B', weight: 1 },
  ];

  it('returns empty for non-candidate items', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'measures', type: 'proposition',
      title: 'Prop', questionText: '', explanation: '',
    };
    expect(computeCandidateMatches(item, userAxes)).toEqual([]);
  });

  it('ranks candidates by match percentage', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'contests', type: 'candidate_race',
      title: 'Race', questionText: '', explanation: '',
      relevantAxes: ['axis1'],
      candidates: [
        { id: 'c1', name: 'Close', profile: { stances: { axis1: 3 } } },
        { id: 'c2', name: 'Far', profile: { stances: { axis1: 9 } } },
      ],
    };
    const matches = computeCandidateMatches(item, userAxes);
    expect(matches).toHaveLength(2);
    expect(matches[0].candidateId).toBe('c1');
    expect(matches[0].matchPercent).toBeGreaterThan(matches[1].matchPercent);
  });

  it('marks best match when above 50%', () => {
    const item: BallotItem = {
      id: '1', categoryId: 'contests', type: 'candidate_race',
      title: 'Race', questionText: '', explanation: '',
      relevantAxes: ['axis1'],
      candidates: [
        { id: 'c1', name: 'Close', profile: { stances: { axis1: 3 } } },
      ],
    };
    const matches = computeCandidateMatches(item, userAxes);
    expect(matches[0].isBestMatch).toBe(true);
  });
});

describe('DEFAULT_CATEGORIES', () => {
  it('has measures and contests categories', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(2);
    expect(DEFAULT_CATEGORIES.map((c) => c.id)).toContain('measures');
    expect(DEFAULT_CATEGORIES.map((c) => c.id)).toContain('contests');
  });
});
