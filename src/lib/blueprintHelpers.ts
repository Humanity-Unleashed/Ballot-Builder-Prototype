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
// Domain summary sentence generator
// ────────────────────────────────────────────

type Lean = 'left' | 'center' | 'right';

function classifyLean(value: number): Lean {
  if (value <= 3) return 'left';
  if (value >= 7) return 'right';
  return 'center';
}

function dominantLean(leans: Lean[]): Lean {
  const counts = { left: 0, center: 0, right: 0 };
  for (const l of leans) counts[l]++;
  if (counts.left > counts.right && counts.left >= counts.center) return 'left';
  if (counts.right > counts.left && counts.right >= counts.center) return 'right';
  return 'center';
}

/**
 * Generates a synthesized plain-language summary for a domain.
 * Not a list of positions — reads like a human characterization.
 * Identifies the overall pattern + calls out tensions or nuances.
 */
export function getDomainSummary(
  domainId: string,
  axisValues: { axisId: string; value: number }[],
): string {
  const v = (id: string) => axisValues.find((a) => a.axisId === id)?.value ?? 5;
  const l = (id: string) => classifyLean(v(id));

  switch (domainId) {
    case 'econ':
      return getEconSummary(v, l);
    case 'health':
      return getHealthSummary(v, l);
    case 'housing':
      return getHousingSummary(v, l);
    case 'justice':
      return getJusticeSummary(v, l);
    case 'climate':
      return getClimateSummary(v, l);
    default:
      return '';
  }
}

function getEconSummary(v: (id: string) => number, l: (id: string) => Lean): string {
  const leans = ['econ_safetynet', 'econ_investment', 'econ_school_choice', 'econ_tax_structure'].map(l);
  const overall = dominantLean(leans);

  // Check for interesting tensions
  const schoolChoiceLean = l('econ_school_choice');
  const spendingLean = dominantLean([l('econ_safetynet'), l('econ_investment')]);

  if (overall === 'left') {
    const base = 'You see government as having a strong role in the economy — broader safety nets, public investment, and progressive taxation.';
    if (schoolChoiceLean === 'right') return base + ' That said, you\'re open to expanding school choice options.';
    return base;
  }
  if (overall === 'right') {
    const base = 'You favor a leaner economic approach — more targeted programs, lower spending, and keeping taxes simple.';
    if (l('econ_safetynet') === 'left') return base + ' Though you still support a relatively broad safety net.';
    return base;
  }
  // Center / mixed
  if (spendingLean === 'left' && schoolChoiceLean === 'right') {
    return 'You support public investment and a solid safety net, but you also want families to have more educational choices — a mix of public commitment and personal flexibility.';
  }
  return 'You take a balanced approach to the economy — weighing public investment against fiscal restraint, and looking for practical tradeoffs rather than sweeping changes.';
}

function getHealthSummary(v: (id: string) => number, l: (id: string) => Lean): string {
  const leans = ['health_coverage_model', 'health_cost_control', 'health_public_health'].map(l);
  const overall = dominantLean(leans);

  if (overall === 'left') {
    const base = 'You believe healthcare should be more of a public good — broader coverage, government cost controls, and proactive public health measures.';
    if (l('health_public_health') === 'right') return 'You want broader coverage and government cost controls, but prefer a lighter touch on public health mandates — people should mostly make their own health decisions.';
    return base;
  }
  if (overall === 'right') {
    const base = 'You favor market-driven healthcare — private coverage options, competition to control costs, and individual choice on public health decisions.';
    if (l('health_coverage_model') === 'left') return 'You want broader access to coverage, but think competition and individual choice are the best tools for controlling costs and managing public health.';
    return base;
  }
  // Center
  if (l('health_coverage_model') === 'left' && l('health_cost_control') === 'right') {
    return 'You want more people covered, but think market competition is a better cost control tool than price regulation — a pragmatic split.';
  }
  return 'You see merit on both sides of the healthcare debate — some public role in coverage and costs, but with room for markets and personal choice.';
}

function getHousingSummary(v: (id: string) => number, l: (id: string) => Lean): string {
  const leans = ['housing_supply_zoning', 'housing_affordability_tools', 'housing_transport_priority'].map(l);
  const overall = dominantLean(leans);

  if (overall === 'left') {
    const base = 'You want to see more housing built, stronger affordability protections, and better public transit — an active approach to making cities work for more people.';
    if (l('housing_supply_zoning') === 'right') return 'You support affordability tools and transit investment, but think local communities should have more say over what gets built in their neighborhoods.';
    return base;
  }
  if (overall === 'right') {
    const base = 'You trust the market to sort out housing and transportation — less zoning regulation, fewer affordability mandates, and car-friendly infrastructure.';
    if (l('housing_transport_priority') === 'left') return 'You prefer lighter regulation on housing and zoning, but you do see value in investing in public transit options.';
    return base;
  }
  // Center
  if (l('housing_supply_zoning') === 'left' && l('housing_affordability_tools') === 'right') {
    return 'You want to build more housing by loosening zoning rules, but think the market — not rent controls — is the best path to affordability. A supply-side approach.';
  }
  return 'You take a moderate approach to housing — balancing development with neighborhood input, and mixing market solutions with some affordability protections.';
}

function getJusticeSummary(v: (id: string) => number, l: (id: string) => Lean): string {
  const leans = ['justice_policing_accountability', 'justice_sentencing_goals', 'justice_firearms', 'justice_reproductive'].map(l);
  const overall = dominantLean(leans);

  const firearmsLean = l('justice_firearms');
  const reproLean = l('justice_reproductive');

  if (overall === 'left') {
    const base = 'You lean toward reform on justice issues — more police oversight, rehabilitation over punishment, and stronger safeguards.';
    if (firearmsLean === 'right') return base + ' Though you take a more permissive stance on firearms.';
    if (reproLean === 'right') return base + ' Though you hold a more restrictive view on reproductive policy.';
    return base;
  }
  if (overall === 'right') {
    const base = 'You prioritize public safety and accountability — supporting law enforcement, firm sentencing, and individual rights.';
    if (firearmsLean === 'left') return base + ' Though you do support stronger gun regulations.';
    if (reproLean === 'left') return base + ' Though you support broader reproductive rights.';
    return base;
  }
  // Center / mixed — common pattern: split on guns vs. policing
  if (l('justice_policing_accountability') === 'left' && firearmsLean === 'right') {
    return 'You want more police oversight and reform-minded sentencing, but take a more permissive view on gun rights — a civil-liberties-across-the-board approach.';
  }
  if (l('justice_policing_accountability') === 'right' && firearmsLean === 'left') {
    return 'You support law enforcement with stronger gun regulations — prioritizing public safety tools on both sides of the badge.';
  }
  return 'You hold a mix of views on justice issues — looking at each question on its own merits rather than following a single ideological thread.';
}

function getClimateSummary(v: (id: string) => number, l: (id: string) => Lean): string {
  const leans = ['climate_ambition', 'climate_energy_portfolio', 'climate_permitting'].map(l);
  const overall = dominantLean(leans);

  if (overall === 'left') {
    const base = 'You want aggressive action on climate — fast transition to clean energy with thorough environmental review.';
    if (l('climate_permitting') === 'right') return 'You want ambitious climate action and a clean energy transition, and you\'re willing to streamline permitting to get projects built faster.';
    return base;
  }
  if (overall === 'right') {
    const base = 'You favor a gradual approach to energy transition — keeping all options on the table and avoiding regulations that could raise costs too quickly.';
    if (l('climate_ambition') === 'left') return 'You recognize the urgency of climate change, but think a diverse energy mix and faster permitting are more practical than aggressive mandates.';
    return base;
  }
  // Center
  if (l('climate_ambition') === 'left' && l('climate_energy_portfolio') === 'right') {
    return 'You want to move faster on climate, but think we need all energy sources — including fossil fuels — during the transition. Ambitious goals, pragmatic tools.';
  }
  return 'You take a balanced approach to climate — supporting a steady transition without drastic mandates, and weighing environmental goals against economic costs.';
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
