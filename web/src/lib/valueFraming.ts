/**
 * Value-Framed Explanation Language
 *
 * Maps meta-dimension scores to Schwartz-grounded value language for
 * explaining why ballot measures or policy positions resonate (or create
 * tension) with a user's civic blueprint.
 *
 * This is a pure copy/language utility -- it does not change scoring,
 * assessment flow, or data models.
 */

import type { MetaDimensionScores } from './archetypes';
import { META_AXIS_MAP } from './archetypes';

// ============================================
// Types
// ============================================

type MetaDimensionKey = keyof MetaDimensionScores;
type Pole = 'negative' | 'positive';

export interface ValueFramingConfig {
  metaDimension: MetaDimensionKey;
  /** negative = left/community/change/rules, positive = right/individual/stability/flexibility */
  pole: Pole;

  /** Schwartz mapping (internal documentation only, not shown to users) */
  schwartzValues: string[];

  /** User-facing language */
  coreValueLabel: string;
  shortPhrase: string;
  resonanceFraming: string;
  tradeoffFraming: string;

  /** Sentence fragments for template composition */
  fragments: {
    youValuePhrase: string;
    thisMattersPhrase: string;
    alignmentPhrase: string;
    tensionPhrase: string;
  };
}

// ============================================
// Framing Data
// ============================================

const NEUTRAL_THRESHOLD = 0.15;

export const VALUE_FRAMING: ValueFramingConfig[] = [
  // RESPONSIBILITY ORIENTATION
  {
    metaDimension: 'responsibility_orientation',
    pole: 'negative', // Community-led
    schwartzValues: ['universalism', 'benevolence'],
    coreValueLabel: 'collective wellbeing',
    shortPhrase: 'shared responsibility and mutual support',
    resonanceFraming: 'This connects to your belief that we do better when we look out for each other.',
    tradeoffFraming: 'You might weigh this against concerns about efficiency or individual choice.',
    fragments: {
      youValuePhrase: 'you value community-level solutions and shared responsibility',
      thisMattersPhrase: 'this matters to people who believe strong communities require collective investment',
      alignmentPhrase: 'this aligns with your preference for solutions that spread risk and responsibility broadly',
      tensionPhrase: 'this may create tension with your value of collective approaches to shared problems',
    },
  },
  {
    metaDimension: 'responsibility_orientation',
    pole: 'positive', // Individual-led
    schwartzValues: ['achievement', 'power', 'self-direction'],
    coreValueLabel: 'personal responsibility',
    shortPhrase: 'individual initiative and self-reliance',
    resonanceFraming: 'This connects to your belief that people thrive when they have ownership over their own outcomes.',
    tradeoffFraming: 'You might weigh this against concerns about those who face systemic barriers.',
    fragments: {
      youValuePhrase: 'you value individual agency and personal accountability',
      thisMattersPhrase: 'this matters to people who believe in earned success and self-determination',
      alignmentPhrase: 'this aligns with your preference for solutions that reward initiative and preserve choice',
      tensionPhrase: 'this may create tension with your value of personal freedom and individual responsibility',
    },
  },

  // CHANGE TEMPO
  {
    metaDimension: 'change_tempo',
    pole: 'negative', // Change-seeking
    schwartzValues: ['self-direction', 'stimulation', 'universalism'],
    coreValueLabel: 'progress and adaptation',
    shortPhrase: 'trying new approaches to solve problems',
    resonanceFraming: 'This connects to your belief that better solutions often require trying something new.',
    tradeoffFraming: 'You might weigh this against risks of unintended consequences.',
    fragments: {
      youValuePhrase: 'you value innovation and willingness to update approaches that aren\'t working',
      thisMattersPhrase: 'this matters to people who believe progress requires openness to change',
      alignmentPhrase: 'this aligns with your appetite for reform and fresh approaches',
      tensionPhrase: 'this may create tension with your openness to change and reform',
    },
  },
  {
    metaDimension: 'change_tempo',
    pole: 'positive', // Stability-seeking
    schwartzValues: ['security', 'tradition', 'conformity'],
    coreValueLabel: 'continuity and proven approaches',
    shortPhrase: 'building on what already works',
    resonanceFraming: 'This connects to your belief that stability and predictability have real value.',
    tradeoffFraming: 'You might weigh this against missed opportunities for improvement.',
    fragments: {
      youValuePhrase: 'you value tested approaches and predictable outcomes',
      thisMattersPhrase: 'this matters to people who believe stability enables long-term planning and trust',
      alignmentPhrase: 'this aligns with your preference for incremental change and proven methods',
      tensionPhrase: 'this may create tension with your value of continuity and careful deliberation',
    },
  },

  // GOVERNANCE STYLE
  {
    metaDimension: 'governance_style',
    pole: 'negative', // Rules & standards
    schwartzValues: ['universalism', 'security', 'conformity'],
    coreValueLabel: 'consistent standards',
    shortPhrase: 'clear rules that apply to everyone',
    resonanceFraming: 'This connects to your belief that fairness requires consistent, enforceable standards.',
    tradeoffFraming: 'You might weigh this against concerns about rigidity or one-size-fits-all mandates.',
    fragments: {
      youValuePhrase: 'you value clear guidelines and accountability through consistent rules',
      thisMattersPhrase: 'this matters to people who believe fairness requires standards that apply equally',
      alignmentPhrase: 'this aligns with your preference for transparent, enforceable standards',
      tensionPhrase: 'this may create tension with your belief in consistent rules and oversight',
    },
  },
  {
    metaDimension: 'governance_style',
    pole: 'positive', // Flexibility & choice
    schwartzValues: ['self-direction', 'achievement', 'power'],
    coreValueLabel: 'flexibility and local control',
    shortPhrase: 'room to adapt to specific situations',
    resonanceFraming: 'This connects to your belief that good solutions often require flexibility and local judgment.',
    tradeoffFraming: 'You might weigh this against concerns about inconsistency or gaps in protection.',
    fragments: {
      youValuePhrase: 'you value adaptability and solutions tailored to specific contexts',
      thisMattersPhrase: 'this matters to people who believe one-size-fits-all approaches often miss the mark',
      alignmentPhrase: 'this aligns with your preference for local discretion and flexible implementation',
      tensionPhrase: 'this may create tension with your value of flexibility and context-sensitive solutions',
    },
  },
];

// ============================================
// Utility Functions
// ============================================

/**
 * Get the value framing config for a user's dominant pole on a meta-dimension.
 *
 * @param metaDimension - The meta-dimension key
 * @param score - The user's score on that dimension, range [-1, +1]
 * @returns The ValueFramingConfig for their dominant pole, or null if neutral
 */
export function getValueFraming(
  metaDimension: MetaDimensionKey,
  score: number
): ValueFramingConfig | null {
  if (Math.abs(score) < NEUTRAL_THRESHOLD) return null;

  const pole: Pole = score < 0 ? 'negative' : 'positive';
  return VALUE_FRAMING.find(
    (vf) => vf.metaDimension === metaDimension && vf.pole === pole
  ) ?? null;
}

/**
 * Get all dominant value framings for a user's full meta-dimension profile.
 *
 * @param metaScores - The user's 3 meta-dimension scores
 * @returns Array of ValueFramingConfig for each non-neutral dimension
 */
export function getUserValueFramings(
  metaScores: MetaDimensionScores
): ValueFramingConfig[] {
  const dimensions: MetaDimensionKey[] = [
    'responsibility_orientation',
    'change_tempo',
    'governance_style',
  ];
  return dimensions
    .map((dim) => getValueFraming(dim, metaScores[dim]))
    .filter((vf): vf is ValueFramingConfig => vf !== null);
}

/**
 * Generate a brief value summary for the user (e.g., for profile display).
 *
 * @param metaScores - The user's 3 meta-dimension scores
 * @returns A 1-2 sentence summary of their core values
 */
export function generateValueSummary(
  metaScores: MetaDimensionScores
): string {
  const framings = getUserValueFramings(metaScores);

  if (framings.length === 0) {
    return 'Your values are balanced across different perspectives, which means you likely weigh tradeoffs on a case-by-case basis.';
  }

  const valueLabels = framings.map((f) => f.coreValueLabel);

  if (valueLabels.length === 1) {
    return `Your civic perspective centers on ${valueLabels[0]}.`;
  }

  if (valueLabels.length === 2) {
    return `Your civic perspective emphasizes ${valueLabels[0]} and ${valueLabels[1]}.`;
  }

  return `Your civic perspective weaves together ${valueLabels.slice(0, -1).join(', ')}, and ${valueLabels.slice(-1)}.`;
}

/**
 * Generate a framing for why a policy position might resonate or create tension.
 *
 * @param metaScores - User's meta-dimension scores
 * @param policyAlignment - Which meta-dimensions this policy aligns with
 *   (negative score = aligns with negative pole, positive = positive pole)
 * @returns Object with resonance and tension phrase arrays
 */
export function generatePolicyFraming(
  metaScores: MetaDimensionScores,
  policyAlignment: Partial<MetaDimensionScores>
): { resonance: string[]; tension: string[] } {
  const resonance: string[] = [];
  const tension: string[] = [];

  const dimensions: MetaDimensionKey[] = [
    'responsibility_orientation',
    'change_tempo',
    'governance_style',
  ];

  for (const dim of dimensions) {
    const userScore = metaScores[dim];
    const policyScore = policyAlignment[dim];

    if (policyScore === undefined || Math.abs(userScore) < NEUTRAL_THRESHOLD) continue;

    const userPole: Pole = userScore < 0 ? 'negative' : 'positive';
    const policyPole: Pole = policyScore < 0 ? 'negative' : 'positive';
    const framing = VALUE_FRAMING.find(
      (vf) => vf.metaDimension === dim && vf.pole === userPole
    );

    if (!framing) continue;

    if (userPole === policyPole) {
      resonance.push(framing.fragments.alignmentPhrase);
    } else {
      tension.push(framing.fragments.tensionPhrase);
    }
  }

  return { resonance, tension };
}

/**
 * Derive meta-dimension alignment from a proposition's yesAxisEffects.
 *
 * For each meta-dimension, checks which of its contributing axes appear in
 * yesAxisEffects. Converts the effect sign to a meta-dimension score sign:
 *   sum += -yesEffect
 * (negative yesEffect = pushes toward poleA = positive stanceToScore)
 *
 * Returns the average per dimension (only dimensions with >= 1 contributing axis).
 */
export function derivePolicyMetaAlignment(
  yesAxisEffects: Record<string, number>
): Partial<MetaDimensionScores> {
  const result: Partial<MetaDimensionScores> = {};

  for (const [dim, axisIds] of Object.entries(META_AXIS_MAP) as [keyof MetaDimensionScores, string[]][]) {
    let sum = 0;
    let count = 0;
    for (const axisId of axisIds) {
      const effect = yesAxisEffects[axisId];
      if (effect !== undefined) {
        sum += -effect;
        count++;
      }
    }
    if (count > 0) {
      result[dim] = sum / count;
    }
  }

  return result;
}
