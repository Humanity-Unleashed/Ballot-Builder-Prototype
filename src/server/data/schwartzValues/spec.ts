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
  valueId: string;        // Which value this item measures (primary)
  weight: number;         // Scoring weight (typically 1, can be higher for core items)
  reversed: boolean;      // If true, disagree = higher score for value
  tradeoff?: {            // Optional: for tradeoff items that measure two values
    opposingValueId: string;  // The second value being measured
    opposingWeight: number;   // Usually negative (e.g., -0.5) - disagreeing boosts this value
  };
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
    // ============================================================
    // SINGLE-VALUE ITEMS (20 total: 2 per value)
    // These are civic-framed statements measuring one value each
    // ============================================================

    // Universalism (Fairness & Equality) - 2 items
    {
      id: 'univ_1',
      text: 'Everyone should get a fair shot, no matter where they come from.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'univ_2',
      text: 'We should protect the environment, even if it costs us money.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
    },

    // Benevolence (Helping Others) - 2 items
    {
      id: 'bene_1',
      text: 'The government should help families who are struggling to get by.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
    },
    {
      id: 'bene_2',
      text: 'A good society looks out for people who need the most help.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
    },

    // Tradition - 2 items
    {
      id: 'trad_1',
      text: 'Our laws should protect traditional values and ways of life.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
    },
    {
      id: 'trad_2',
      text: 'Religious and cultural traditions should play a role in public life.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
    },

    // Conformity (Respect for Rules) - 2 items
    {
      id: 'conf_1',
      text: 'Strong law enforcement is needed for society to work well.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
    },
    {
      id: 'conf_2',
      text: 'People should follow the rules, even if they don\'t agree with them.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
    },

    // Security (Safety & Stability) - 2 items
    {
      id: 'secu_1',
      text: 'Keeping people safe should be the government\'s top job.',
      valueId: 'security',
      weight: 1,
      reversed: false,
    },
    {
      id: 'secu_2',
      text: 'A steady, predictable society is better than one that keeps changing.',
      valueId: 'security',
      weight: 1,
      reversed: false,
    },

    // Power (Influence & Leadership) - 2 items
    {
      id: 'powr_1',
      text: 'Good leaders need the power to make decisions without too many roadblocks.',
      valueId: 'power',
      weight: 1,
      reversed: false,
    },
    {
      id: 'powr_2',
      text: 'People who built their success have earned their say in how things work.',
      valueId: 'power',
      weight: 1,
      reversed: false,
    },

    // Achievement (Personal Success) - 2 items
    {
      id: 'achi_1',
      text: 'People who work harder should get more rewards.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
    },
    {
      id: 'achi_2',
      text: 'Competition pushes people to do their best.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
    },

    // Hedonism (Enjoying Life) - 2 items
    {
      id: 'hedo_1',
      text: 'Being happy matters just as much as being productive.',
      valueId: 'hedonism',
      weight: 1,
      reversed: false,
    },
    {
      id: 'hedo_2',
      text: 'The government shouldn\'t tell people how to live if they\'re not hurting anyone.',
      valueId: 'hedonism',
      weight: 1,
      reversed: false,
    },

    // Stimulation (New Experiences) - 2 items
    {
      id: 'stim_1',
      text: 'We should try new ideas and technology, even if it shakes things up.',
      valueId: 'stimulation',
      weight: 1,
      reversed: false,
    },
    {
      id: 'stim_2',
      text: 'It\'s worth taking risks on bold new ideas if they could make things better.',
      valueId: 'stimulation',
      weight: 1,
      reversed: false,
    },

    // Self-Direction (Independence) - 2 items
    {
      id: 'sdir_1',
      text: 'People should be free to make their own choices without the government stepping in.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
    },
    {
      id: 'sdir_2',
      text: 'Personal freedom is one of the most important things to protect.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
    },

    // ============================================================
    // TRADEOFF ITEMS (10 total)
    // These measure two values simultaneously - agreeing increases
    // one value score while decreasing the other (opposite/adjacent pairs)
    // ============================================================

    // Tradeoff 1: Security (+) vs Universalism (-)
    // Agreeing = prioritize security over openness/inclusion
    {
      id: 'trade_1',
      text: 'If safety and welcoming newcomers clash, safety should win.',
      valueId: 'security',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'universalism', opposingWeight: -0.5 },
    },

    // Tradeoff 2: Benevolence (+) vs Achievement (-)
    // Agreeing = prioritize helping others over rewarding merit
    {
      id: 'trade_2',
      text: 'Helping people who are struggling matters more than rewarding top performers.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'achievement', opposingWeight: -0.5 },
    },

    // Tradeoff 3: Self-Direction (+) vs Conformity (-)
    // Agreeing = prioritize personal freedom over social norms
    {
      id: 'trade_3',
      text: 'People should live how they want, even if others disapprove.',
      valueId: 'self_direction',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'conformity', opposingWeight: -0.5 },
    },

    // Tradeoff 4: Tradition (+) vs Stimulation (-)
    // Agreeing = prioritize tradition over innovation/change
    {
      id: 'trade_4',
      text: 'Sticking with what\'s worked is better than always trying something new.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'stimulation', opposingWeight: -0.5 },
    },

    // Tradeoff 5: Security (+) vs Self-Direction (-)
    // Agreeing = prioritize safety over personal freedom
    {
      id: 'trade_5',
      text: 'It\'s okay to give up some freedom if it makes everyone safer.',
      valueId: 'security',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'self_direction', opposingWeight: -0.5 },
    },

    // Tradeoff 6: Universalism (+) vs Power (-)
    // Agreeing = prioritize equality over protecting advantages of successful
    {
      id: 'trade_6',
      text: 'Closing the gap between rich and poor matters more than protecting what the wealthy have built.',
      valueId: 'universalism',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'power', opposingWeight: -0.5 },
    },

    // Tradeoff 7: Benevolence (+) vs Power (-)
    // Agreeing = prioritize community support over self-reliance
    {
      id: 'trade_7',
      text: 'Communities should step up to help people in need, not just tell them to figure it out.',
      valueId: 'benevolence',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'power', opposingWeight: -0.5 },
    },

    // Tradeoff 8: Achievement (+) vs Universalism (-)
    // Agreeing = prioritize merit-based outcomes over equal outcomes
    {
      id: 'trade_8',
      text: 'Rewarding people based on what they earn is fairer than making sure everyone gets the same.',
      valueId: 'achievement',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'universalism', opposingWeight: -0.5 },
    },

    // Tradeoff 9: Tradition (+) vs Self-Direction (-)
    // Agreeing = prioritize established customs over self-expression
    {
      id: 'trade_9',
      text: 'Following traditions matters more than doing your own thing.',
      valueId: 'tradition',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'self_direction', opposingWeight: -0.5 },
    },

    // Tradeoff 10: Conformity (+) vs Hedonism (-)
    // Agreeing = prioritize social responsibility over personal enjoyment
    {
      id: 'trade_10',
      text: 'Doing your part for society is more important than enjoying yourself.',
      valueId: 'conformity',
      weight: 1,
      reversed: false,
      tradeoff: { opposingValueId: 'hedonism', opposingWeight: -0.5 },
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
