/**
 * Blueprint Helper Functions
 *
 * Pure utility functions extracted from the Blueprint screen.
 * No React dependencies -- these are plain data transforms.
 */

import { getSliderConfig, sliderPositionToScore } from '@/data/sliderPositions';
import type { MetaDimensionScores } from '@/lib/archetypes';
import type { Spec, SwipeResponse } from '@/types/civicAssessment';

// ────────────────────────────────────────────
// Domain display names
// ────────────────────────────────────────────

export const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  econ: 'Economy',
  health: 'Healthcare',
  housing: 'Housing',
  justice: 'Justice',
  climate: 'Climate',
};

// ────────────────────────────────────────────
// Slider / position helpers
// ────────────────────────────────────────────

export function getSliderThumbColor(position: number, totalPositions: number): string {
  const normalizedPosition = position / (totalPositions - 1);
  if (normalizedPosition <= 0.3) return '#8B7AAF';
  if (normalizedPosition >= 0.7) return '#5B9E94';
  return '#6B7280';
}

export function getGradientSegmentColor(index: number, totalSegments: number): string {
  const t = index / (totalSegments - 1);
  if (t < 0.5) {
    const factor = t * 2;
    const r = Math.round(139 + (229 - 139) * factor);
    const g = Math.round(122 + (231 - 122) * factor);
    const b = Math.round(175 + (235 - 175) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const factor = (t - 0.5) * 2;
    const r = Math.round(229 + (91 - 229) * factor);
    const g = Math.round(231 + (158 - 231) * factor);
    const b = Math.round(235 + (148 - 235) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getDomainEmoji(domainId: string): string {
  switch (domainId) {
    case 'econ': return '\u{1F4B0}';
    case 'health': return '\u{1F3E5}';
    case 'housing': return '\u{1F3E0}';
    case 'justice': return '\u{1F6E1}\uFE0F';
    case 'climate': return '\u{1F331}';
    default: return '\u{1F4CB}';
  }
}

export function valueToPositionIndex(value: number, totalPositions: number): number {
  return Math.round((value / 10) * (totalPositions - 1));
}

export function getPositionLabel(axisId: string, value: number): string {
  const config = getSliderConfig(axisId);
  if (!config) {
    if (value <= 2) return 'Strongly lean left';
    if (value <= 4) return 'Lean left';
    if (value <= 6) return 'Balanced / Mixed';
    if (value <= 8) return 'Lean right';
    return 'Strongly lean right';
  }
  const positionIndex = valueToPositionIndex(value, config.positions.length);
  return config.positions[positionIndex]?.title || 'Mixed';
}

// ────────────────────────────────────────────
// Strength / importance helpers
// ────────────────────────────────────────────

export type StrengthLevel = { label: string; value: number };

export const STRENGTH_LEVELS: StrengthLevel[] = [
  { label: 'A little', value: 3 },
  { label: 'Moderately', value: 5 },
  { label: 'Strongly', value: 8 },
];

export const DEFAULT_STRENGTH_VALUE = 5;

export function getImportanceLabel(v: number): string {
  if (v < 4) return 'A little';
  if (v <= 7) return 'Moderately';
  return 'Strongly';
}

// ────────────────────────────────────────────
// Values spectrum helpers
// ────────────────────────────────────────────

export function scoreToPercents(score: number, invert: boolean): { leftPct: number; rightPct: number } {
  const leftPct = Math.round(((invert ? score : -score) + 1) / 2 * 100);
  return { leftPct, rightPct: 100 - leftPct };
}

export const STRONG_THRESHOLD = 70;
export const MODERATE_THRESHOLD = 58;

export const SPECTRUM_BARS: {
  key: keyof MetaDimensionScores;
  axisName: string;
  leftLabel: string;
  rightLabel: string;
  leftIdLabel: string;
  rightIdLabel: string;
  leftModerateLabel: string;
  rightModerateLabel: string;
  balancedLabel: string;
  leftColor: string;
  rightColor: string;
  invert: boolean;
}[] = [
  {
    key: 'responsibility_orientation',
    axisName: 'Social Model',
    leftLabel: 'Community',
    rightLabel: 'Individual',
    leftIdLabel: 'Communitarian',
    rightIdLabel: 'Individualist',
    leftModerateLabel: 'Community Pragmatist',
    rightModerateLabel: 'Independent Cooperator',
    balancedLabel: 'Civic Pluralist',
    leftColor: '#6E72A8',
    rightColor: '#C4895A',
    invert: false,
  },
  {
    key: 'change_tempo',
    axisName: 'Reform Appetite',
    leftLabel: 'Stability',
    rightLabel: 'Change',
    leftIdLabel: 'Incrementalist',
    rightIdLabel: 'Reformist',
    leftModerateLabel: 'Cautious Reformer',
    rightModerateLabel: 'Measured Reformist',
    balancedLabel: 'Adaptive Moderate',
    leftColor: '#5B8DA6',
    rightColor: '#B5616E',
    invert: true,
  },
  {
    key: 'governance_style',
    axisName: 'Oversight',
    leftLabel: 'Standards',
    rightLabel: 'Flexibility',
    leftIdLabel: 'Regulationist',
    rightIdLabel: 'Autonomist',
    leftModerateLabel: 'Principled Pragmatist',
    rightModerateLabel: 'Guided Autonomist',
    balancedLabel: 'Contextual Evaluator',
    leftColor: '#B5A05A',
    rightColor: '#5E9A6E',
    invert: false,
  },
];

export function getGraduatedLabel(
  leftPct: number,
  rightPct: number,
  bar: typeof SPECTRUM_BARS[number],
): { label: string; color: string } {
  const winnerPct = Math.max(leftPct, rightPct);
  const leftWins = leftPct > rightPct;

  if (winnerPct < MODERATE_THRESHOLD) {
    return { label: bar.balancedLabel, color: '#6B7280' };
  }
  if (winnerPct < STRONG_THRESHOLD) {
    return {
      label: leftWins ? bar.leftModerateLabel : bar.rightModerateLabel,
      color: leftWins ? bar.leftColor : bar.rightColor,
    };
  }
  return {
    label: leftWins ? bar.leftIdLabel : bar.rightIdLabel,
    color: leftWins ? bar.leftColor : bar.rightColor,
  };
}

// ────────────────────────────────────────────
// Axis / domain helpers
// ────────────────────────────────────────────

export function getAxesForDomains(spec: Spec, selectedDomains: Set<string>): string[] {
  const axes: string[] = [];
  spec.domains.forEach((domain) => {
    if (selectedDomains.has(domain.id)) {
      axes.push(...domain.axes);
    }
  });
  return axes;
}

export function checkForAxisTransition(currentIndex: number, totalAxes: number): string | null {
  if (currentIndex === Math.floor(totalAxes * 0.33)) {
    return 'Great start! Building your civic blueprint...';
  } else if (currentIndex === Math.floor(totalAxes * 0.66)) {
    return 'Almost there! Refining your positions...';
  }
  return null;
}

// ────────────────────────────────────────────
// Convert responses to swipe events
// ────────────────────────────────────────────

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
}

export function convertResponsesToSwipes(
  responses: Record<string, number>,
  spec: Spec,
): SwipeEvent[] {
  const swipeEvents: SwipeEvent[] = [];

  Object.entries(responses).forEach(([axisId, position]) => {
    const config = getSliderConfig(axisId);
    if (!config) return;

    const totalPositions = config.positions.length;
    const score = sliderPositionToScore(position, totalPositions);

    const axisItems = spec.items.filter((item) => axisId in item.axis_keys);

    axisItems.slice(0, 2).forEach((item) => {
      const key = item.axis_keys[axisId];
      let response: SwipeResponse;
      const effectiveScore = score * key;

      if (effectiveScore <= -0.6) {
        response = 'strong_disagree';
      } else if (effectiveScore <= -0.2) {
        response = 'disagree';
      } else if (effectiveScore >= 0.6) {
        response = 'strong_agree';
      } else if (effectiveScore >= 0.2) {
        response = 'agree';
      } else {
        response = 'unsure';
      }

      swipeEvents.push({ item_id: item.id, response });
    });
  });

  return swipeEvents;
}
