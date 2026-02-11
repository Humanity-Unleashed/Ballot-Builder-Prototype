import { describe, it, expect } from 'vitest';
import {
  calculateUserVector,
  cosineSimilarity,
  similarityToConfidence,
  getConfidenceLevel,
  getConfidenceColor,
  responsesNeededForConfidence,
  type Response,
} from '../scoring';

describe('calculateUserVector', () => {
  it('returns neutral vector for empty responses', () => {
    expect(calculateUserVector([])).toEqual([0, 0, 0, 0, 0]);
  });

  it('returns the vector itself for a single agree response', () => {
    const responses: Response[] = [
      { statementId: 's1', response: 'agree', vector: [1, 0, 0, 0, 0] },
    ];
    expect(calculateUserVector(responses)).toEqual([1, 0, 0, 0, 0]);
  });

  it('negates vector for a single disagree response', () => {
    const responses: Response[] = [
      { statementId: 's1', response: 'disagree', vector: [1, 0, 0, 0, 0] },
    ];
    expect(calculateUserVector(responses)).toEqual([-1, 0, 0, 0, 0]);
  });

  it('averages multiple responses', () => {
    const responses: Response[] = [
      { statementId: 's1', response: 'agree', vector: [1, 0, 0, 0, 0] },
      { statementId: 's2', response: 'agree', vector: [0, 1, 0, 0, 0] },
    ];
    expect(calculateUserVector(responses)).toEqual([0.5, 0.5, 0, 0, 0]);
  });

  it('handles mixed agree/disagree', () => {
    const responses: Response[] = [
      { statementId: 's1', response: 'agree', vector: [1, 1, 0, 0, 0] },
      { statementId: 's2', response: 'disagree', vector: [1, -1, 0, 0, 0] },
    ];
    const result = calculateUserVector(responses);
    expect(result[0]).toBe(0); // (1 + -1) / 2 = 0
    expect(result[1]).toBe(1); // (1 + 1) / 2 = 1
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1);
  });

  it('returns -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBe(-1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('returns 0 for a zero vector', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it('throws for vectors of different lengths', () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow('Vectors must be the same length');
  });

  it('throws for empty vectors', () => {
    expect(() => cosineSimilarity([], [])).toThrow('Vectors cannot be empty');
  });

  it('computes similarity for non-unit vectors', () => {
    const sim = cosineSimilarity([3, 4], [3, 4]);
    expect(sim).toBeCloseTo(1, 5);
  });
});

describe('similarityToConfidence', () => {
  it('maps -1 to 0', () => {
    expect(similarityToConfidence(-1)).toBe(0);
  });

  it('maps 0 to 50', () => {
    expect(similarityToConfidence(0)).toBe(50);
  });

  it('maps 1 to 100', () => {
    expect(similarityToConfidence(1)).toBe(100);
  });

  it('maps 0.5 to 75', () => {
    expect(similarityToConfidence(0.5)).toBe(75);
  });
});

describe('getConfidenceLevel', () => {
  it('returns low for < 50', () => {
    expect(getConfidenceLevel(0)).toBe('low');
    expect(getConfidenceLevel(49)).toBe('low');
  });

  it('returns moderate for 50-74', () => {
    expect(getConfidenceLevel(50)).toBe('moderate');
    expect(getConfidenceLevel(74)).toBe('moderate');
  });

  it('returns high for >= 75', () => {
    expect(getConfidenceLevel(75)).toBe('high');
    expect(getConfidenceLevel(100)).toBe('high');
  });
});

describe('getConfidenceColor', () => {
  it('returns red for low confidence', () => {
    expect(getConfidenceColor(30)).toBe('#FF3B30');
  });

  it('returns orange for moderate confidence', () => {
    expect(getConfidenceColor(60)).toBe('#FF9500');
  });

  it('returns green for high confidence', () => {
    expect(getConfidenceColor(80)).toBe('#34C759');
  });
});

describe('responsesNeededForConfidence', () => {
  it('returns correct needed for low target', () => {
    expect(responsesNeededForConfidence(0, 40)).toBe(10);
    expect(responsesNeededForConfidence(5, 40)).toBe(5);
  });

  it('returns correct needed for moderate target', () => {
    expect(responsesNeededForConfidence(0, 60)).toBe(20);
    expect(responsesNeededForConfidence(15, 60)).toBe(5);
  });

  it('returns correct needed for high target', () => {
    expect(responsesNeededForConfidence(0, 80)).toBe(30);
    expect(responsesNeededForConfidence(30, 80)).toBe(0);
  });

  it('returns 0 when already have enough', () => {
    expect(responsesNeededForConfidence(50, 80)).toBe(0);
  });
});
