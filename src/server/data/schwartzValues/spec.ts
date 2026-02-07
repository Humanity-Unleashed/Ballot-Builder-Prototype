/**
 * Schwartz Values Specification v1.0.0
 *
 * Based on Schwartz's Theory of Basic Human Values with:
 * - 10 basic values (with relatable display names)
 * - 4 higher-order dimensions
 * - 5-point Likert scale assessment items
 *
 * Reference: Schwartz, S.H. (1992, 2012)
 */

export interface SchwartzValue {
  id: string;
  name: string;           // Relatable display name
  schwartzName: string;   // Original Schwartz term
  description: string;
  dimension: string;      // Higher-order dimension ID
  oppositeValue: string;  // ID of opposing value in circumplex
}

export interface SchwartzDimension {
  id: string;
  name: string;           // Relatable display name
  schwartzName: string;   // Original Schwartz term
  description: string;
  values: string[];       // IDs of values in this dimension
  oppositeDimension: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  valueId: string;        // Which value this item measures
  weight: number;         // Scoring weight (typically 1, can be higher for core items)
  reversed: boolean;      // If true, disagree = higher score for value
}

export interface SchwartzSpec {
  spec_version: string;
  generated_at_utc: string;
  response_scale: {
    strongly_disagree: number;
    disagree: number;
    neutral: number;
    agree: number;
    strongly_agree: number;
  };
  scoring: {
    value_range: [number, number];
    use_ipsatization: boolean;
    ipsatization_note: string;
  };
  dimensions: SchwartzDimension[];
  values: SchwartzValue[];
  items: AssessmentItem[];
}

export const schwartzSpec: SchwartzSpec = {
  spec_version: '1.0.0',
  generated_at_utc: new Date().toISOString(),
  response_scale: {
    strongly_disagree: 1,
    disagree: 2,
    neutral: 3,
    agree: 4,
    strongly_agree: 5,
  },
  scoring: {
    value_range: [1, 5],
    use_ipsatization: true,
    ipsatization_note:
      'Ipsatization centers scores on individual mean to control for response style bias. Final scores show relative priority within the individual.',
  },
  dimensions: [
    {
      id: 'self_transcendence',
      name: 'Caring for Others',
      schwartzName: 'Self-Transcendence',
      description:
        'Concern for the welfare of others and nature, beyond personal interests.',
      values: ['universalism', 'benevolence'],
      oppositeDimension: 'self_enhancement',
    },
    {
      id: 'self_enhancement',
      name: 'Getting Ahead',
      schwartzName: 'Self-Enhancement',
      description:
        'Pursuing personal success, status, and dominance over others.',
      values: ['achievement', 'power'],
      oppositeDimension: 'self_transcendence',
    },
    {
      id: 'openness',
      name: 'Embracing Change',
      schwartzName: 'Openness to Change',
      description:
        'Valuing independent thought, action, and readiness for new experiences.',
      values: ['self_direction', 'stimulation', 'hedonism'],
      oppositeDimension: 'conservation',
    },
    {
      id: 'conservation',
      name: 'Preserving Stability',
      schwartzName: 'Conservation',
      description:
        'Emphasis on order, self-restriction, preservation of the past, and resistance to change.',
      values: ['security', 'conformity', 'tradition'],
      oppositeDimension: 'openness',
    },
  ],
  values: [
    // Self-Transcendence values
    {
      id: 'universalism',
      name: 'Fairness & Equality',
      schwartzName: 'Universalism',
      description:
        'Understanding, appreciation, tolerance, and protection for the welfare of all people and nature.',
      dimension: 'self_transcendence',
      oppositeValue: 'power',
    },
    {
      id: 'benevolence',
      name: 'Helping Others',
      schwartzName: 'Benevolence',
      description:
        'Preserving and enhancing the welfare of those with whom one is in frequent personal contact.',
      dimension: 'self_transcendence',
      oppositeValue: 'achievement',
    },
    // Conservation values
    {
      id: 'tradition',
      name: 'Tradition',
      schwartzName: 'Tradition',
      description:
        'Respect, commitment, and acceptance of the customs and ideas that traditional culture or religion provide.',
      dimension: 'conservation',
      oppositeValue: 'self_direction',
    },
    {
      id: 'conformity',
      name: 'Respect for Rules',
      schwartzName: 'Conformity',
      description:
        'Restraint of actions, inclinations, and impulses likely to upset or harm others and violate social expectations.',
      dimension: 'conservation',
      oppositeValue: 'stimulation',
    },
    {
      id: 'security',
      name: 'Safety & Stability',
      schwartzName: 'Security',
      description:
        'Safety, harmony, and stability of society, relationships, and self.',
      dimension: 'conservation',
      oppositeValue: 'hedonism',
    },
    // Self-Enhancement values
    {
      id: 'power',
      name: 'Influence & Leadership',
      schwartzName: 'Power',
      description:
        'Social status and prestige, control or dominance over people and resources.',
      dimension: 'self_enhancement',
      oppositeValue: 'universalism',
    },
    {
      id: 'achievement',
      name: 'Personal Success',
      schwartzName: 'Achievement',
      description:
        'Personal success through demonstrating competence according to social standards.',
      dimension: 'self_enhancement',
      oppositeValue: 'benevolence',
    },
    // Openness to Change values
    {
      id: 'hedonism',
      name: 'Enjoying Life',
      schwartzName: 'Hedonism',
      description: 'Pleasure and sensuous gratification for oneself.',
      dimension: 'openness',
      oppositeValue: 'security',
    },
    {
      id: 'stimulation',
      name: 'New Experiences',
      schwartzName: 'Stimulation',
      description: 'Excitement, novelty, and challenge in life.',
      dimension: 'openness',
      oppositeValue: 'conformity',
    },
    {
      id: 'self_direction',
      name: 'Independence',
      schwartzName: 'Self-Direction',
      description:
        'Independent thought and action—choosing, creating, exploring.',
      dimension: 'openness',
      oppositeValue: 'tradition',
    },
  ],
  items: [
    // Universalism (Fairness & Equality) - 3 items
    {
      id: 'univ_1',
      text: 'Everyone deserves equal opportunities regardless of their background.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'univ_2',
      text: 'Protecting the environment should be a top priority, even if it costs money.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'univ_3',
      text: 'We should try to understand people who are different from us.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
    },

    // Benevolence (Helping Others) - 3 items
    {
      id: 'bene_1',
      text: 'Helping people close to me is one of my most important goals.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
    },
    {
      id: 'bene_2',
      text: 'I go out of my way to be a reliable and trustworthy friend.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
    },
    {
      id: 'bene_3',
      text: 'Loyalty to family and friends is extremely important to me.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
    },

    // Tradition - 3 items
    {
      id: 'trad_1',
      text: 'Traditional values and customs give life meaning.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
    },
    {
      id: 'trad_2',
      text: 'I respect the traditions of my culture or religion.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
    },
    {
      id: 'trad_3',
      text: 'Maintaining time-honored practices is important to me.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
    },

    // Conformity (Respect for Rules) - 3 items
    {
      id: 'conf_1',
      text: 'People should follow rules even when no one is watching.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
    },
    {
      id: 'conf_2',
      text: 'It is important to be polite and not bother others.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
    },
    {
      id: 'conf_3',
      text: 'I try to avoid doing anything that people would consider wrong.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
    },

    // Security (Safety & Stability) - 3 items
    {
      id: 'secu_1',
      text: 'Living in a safe and secure environment is essential to me.',
      valueId: 'security',
      weight: 1,
      reversed: false,
    },
    {
      id: 'secu_2',
      text: 'A stable government and social order are very important.',
      valueId: 'security',
      weight: 1,
      reversed: false,
    },
    {
      id: 'secu_3',
      text: 'I prefer to avoid risks and stick with what I know.',
      valueId: 'security',
      weight: 1,
      reversed: false,
    },

    // Power (Influence & Leadership) - 3 items
    {
      id: 'powr_1',
      text: 'Being in charge and having authority over others appeals to me.',
      valueId: 'power',
      weight: 1,
      reversed: false,
    },
    {
      id: 'powr_2',
      text: 'Having wealth and material possessions is important to me.',
      valueId: 'power',
      weight: 1,
      reversed: false,
    },
    {
      id: 'powr_3',
      text: 'I like to be the one making decisions in a group.',
      valueId: 'power',
      weight: 1,
      reversed: false,
    },

    // Achievement (Personal Success) - 3 items
    {
      id: 'achi_1',
      text: 'Being very successful is important to me.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
    },
    {
      id: 'achi_2',
      text: 'I want people to recognize my accomplishments.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
    },
    {
      id: 'achi_3',
      text: 'I am ambitious and work hard to achieve my goals.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
    },

    // Hedonism (Enjoying Life) - 3 items
    {
      id: 'hedo_1',
      text: "Enjoying life's pleasures is very important to me.",
      valueId: 'hedonism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'hedo_2',
      text: 'I try to have as much fun as possible.',
      valueId: 'hedonism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'hedo_3',
      text: 'Taking time to enjoy myself is a priority.',
      valueId: 'hedonism',
      weight: 1,
      reversed: false,
    },

    // Stimulation (New Experiences) - 3 items
    {
      id: 'stim_1',
      text: 'I seek out new and exciting experiences.',
      valueId: 'stimulation',
      weight: 1,
      reversed: false,
    },
    {
      id: 'stim_2',
      text: 'Variety and change make life more interesting.',
      valueId: 'stimulation',
      weight: 1,
      reversed: false,
    },
    {
      id: 'stim_3',
      text: 'I like to take risks and try new things.',
      valueId: 'stimulation',
      weight: 1,
      reversed: false,
    },

    // Self-Direction (Independence) - 3 items
    {
      id: 'sdir_1',
      text: 'Making my own decisions is very important to me.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
    },
    {
      id: 'sdir_2',
      text: 'I value being creative and thinking for myself.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
    },
    {
      id: 'sdir_3',
      text: 'Freedom to choose what I do is essential to me.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
    },
  ],
};

// Helper to get value by ID
export function getValueById(id: string): SchwartzValue | undefined {
  return schwartzSpec.values.find((v) => v.id === id);
}

// Helper to get dimension by ID
export function getDimensionById(id: string): SchwartzDimension | undefined {
  return schwartzSpec.dimensions.find((d) => d.id === id);
}

// Helper to get items for a value
export function getItemsForValue(valueId: string): AssessmentItem[] {
  return schwartzSpec.items.filter((item) => item.valueId === valueId);
}

// Helper to get all items for a dimension
export function getItemsForDimension(dimensionId: string): AssessmentItem[] {
  const dimension = getDimensionById(dimensionId);
  if (!dimension) return [];
  return schwartzSpec.items.filter((item) =>
    dimension.values.includes(item.valueId)
  );
}
