/**
 * Schwartz Values Specification v2.0.0
 *
 * Based on Schwartz's Theory of Basic Human Values with:
 * - 10 basic values (with relatable display names)
 * - 4 higher-order dimensions
 * - 10 pick-one vignette scenarios (replacing Likert items)
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

export interface VignetteOption {
  id: string;
  text: string;
  valueId: string;        // Which Schwartz value this option maps to
}

export interface Vignette {
  id: string;
  scenario: string;       // The situation description
  options: VignetteOption[];
}

export interface SchwartzSpec {
  spec_version: string;
  generated_at_utc: string;
  scoring: {
    value_range: [number, number];
    use_ipsatization: boolean;
    ipsatization_note: string;
  };
  dimensions: SchwartzDimension[];
  values: SchwartzValue[];
  vignettes: Vignette[];
}

export const schwartzSpec: SchwartzSpec = {
  spec_version: '2.0.0',
  generated_at_utc: new Date().toISOString(),
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
  vignettes: [
    // 1. City Budget → Security, Benevolence, Self-Direction, Tradition
    {
      id: 'v_city_budget',
      scenario: 'Your city has extra money in the budget this year. Which use do you think matters most?',
      options: [
        { id: 'v_city_budget_a', text: 'Hire more police officers and upgrade public safety systems', valueId: 'security' },
        { id: 'v_city_budget_b', text: 'Fund job training and housing assistance for low-income families', valueId: 'benevolence' },
        { id: 'v_city_budget_c', text: 'Cut taxes so people keep more of what they earn', valueId: 'self_direction' },
        { id: 'v_city_budget_d', text: 'Restore historic buildings and fund cultural preservation programs', valueId: 'tradition' },
      ],
    },
    // 2. Vacant Land → Universalism, Achievement, Hedonism, Tradition
    {
      id: 'v_vacant_land',
      scenario: 'A large vacant lot opens up in your neighborhood. What should go there?',
      options: [
        { id: 'v_vacant_land_a', text: 'Affordable housing for families who can\'t afford rent nearby', valueId: 'universalism' },
        { id: 'v_vacant_land_b', text: 'A business hub that attracts companies and creates competitive jobs', valueId: 'achievement' },
        { id: 'v_vacant_land_c', text: 'A park, food hall, and entertainment space for the community to enjoy', valueId: 'hedonism' },
        { id: 'v_vacant_land_d', text: 'A community center modeled after the neighborhood\'s original architecture', valueId: 'tradition' },
      ],
    },
    // 3. School Priorities → Conformity, Self-Direction, Achievement, Benevolence
    {
      id: 'v_school',
      scenario: 'Your school district is choosing a new focus. Which matters most?',
      options: [
        { id: 'v_school_a', text: 'Clear rules, discipline, and respect for authority', valueId: 'conformity' },
        { id: 'v_school_b', text: 'Letting students choose their own courses and learning pace', valueId: 'self_direction' },
        { id: 'v_school_c', text: 'Rigorous academics and college prep to help students compete', valueId: 'achievement' },
        { id: 'v_school_d', text: 'Community service requirements so students learn to help others', valueId: 'benevolence' },
      ],
    },
    // 4. Immigration → Security, Universalism, Power, Benevolence
    {
      id: 'v_immigration',
      scenario: 'Which approach to immigration do you most support?',
      options: [
        { id: 'v_immigration_a', text: 'Stricter border enforcement and reduced immigration levels', valueId: 'security' },
        { id: 'v_immigration_b', text: 'Equal paths to citizenship regardless of where someone comes from', valueId: 'universalism' },
        { id: 'v_immigration_c', text: 'Prioritize immigrants who bring investment, skills, or business experience', valueId: 'power' },
        { id: 'v_immigration_d', text: 'Expand local programs that help immigrants settle in and get on their feet', valueId: 'benevolence' },
      ],
    },
    // 5. New Technology → Security, Self-Direction, Stimulation, Universalism
    {
      id: 'v_technology',
      scenario: 'A new technology could change how people work and live, but it\'s unpredictable. What\'s the right approach?',
      options: [
        { id: 'v_technology_a', text: 'Regulate it carefully to prevent harm and protect existing jobs', valueId: 'security' },
        { id: 'v_technology_b', text: 'Let people and businesses decide for themselves whether to adopt it', valueId: 'self_direction' },
        { id: 'v_technology_c', text: 'Invest heavily in it \u2014 bold moves are how real progress happens', valueId: 'stimulation' },
        { id: 'v_technology_d', text: 'Use it to help close gaps between those who have the most and the least', valueId: 'universalism' },
      ],
    },
    // 6. Noise Complaint → Hedonism, Tradition, Conformity, Achievement
    {
      id: 'v_noise',
      scenario: 'A popular new restaurant/bar wants to expand its hours in a residential neighborhood. Neighbors are divided.',
      options: [
        { id: 'v_noise_a', text: 'Let them expand \u2014 people deserve places to enjoy themselves', valueId: 'hedonism' },
        { id: 'v_noise_b', text: 'Block it \u2014 the neighborhood\'s established character should come first', valueId: 'tradition' },
        { id: 'v_noise_c', text: 'Allow it only with strict noise limits and operating rules', valueId: 'conformity' },
        { id: 'v_noise_d', text: 'Support it if the owner is a local entrepreneur building something successful', valueId: 'achievement' },
      ],
    },
    // 7. Public Health → Security, Self-Direction, Benevolence, Conformity
    {
      id: 'v_health',
      scenario: 'A serious health risk is spreading. What approach makes the most sense?',
      options: [
        { id: 'v_health_a', text: 'Mandatory measures \u2014 masks, closures, whatever it takes to keep people safe', valueId: 'security' },
        { id: 'v_health_b', text: 'Voluntary guidelines \u2014 people should decide their own risk tolerance', valueId: 'self_direction' },
        { id: 'v_health_c', text: 'Focus resources on the people who are most at risk and least able to cope', valueId: 'benevolence' },
        { id: 'v_health_d', text: 'Defer to the leaders and experts who know the situation best', valueId: 'conformity' },
      ],
    },
    // 8. Economic Policy → Power, Achievement, Universalism, Hedonism
    {
      id: 'v_economy',
      scenario: 'The economy is growing but unevenly. What matters most?',
      options: [
        { id: 'v_economy_a', text: 'Make sure business leaders and job creators have the influence to keep things moving', valueId: 'power' },
        { id: 'v_economy_b', text: 'Reward the people who are working hardest and producing the most', valueId: 'achievement' },
        { id: 'v_economy_c', text: 'Raise taxes on the wealthy to fund programs that help everyone equally', valueId: 'universalism' },
        { id: 'v_economy_d', text: 'Focus less on growth and more on making sure people can enjoy their lives', valueId: 'hedonism' },
      ],
    },
    // 9. Education Funding → Stimulation, Tradition, Universalism, Power
    {
      id: 'v_education',
      scenario: 'The state has new education funding to allocate. Where should it go?',
      options: [
        { id: 'v_education_a', text: 'Experimental programs \u2014 new teaching methods, technology, pilot projects', valueId: 'stimulation' },
        { id: 'v_education_b', text: 'Civics and history \u2014 students should understand the traditions that built this country', valueId: 'tradition' },
        { id: 'v_education_c', text: 'Schools in the poorest districts, to level the playing field', valueId: 'universalism' },
        { id: 'v_education_d', text: 'Leadership and management academies to develop future decision-makers', valueId: 'power' },
      ],
    },
    // 10. Criminal Justice → Conformity, Benevolence, Security, Self-Direction
    {
      id: 'v_justice',
      scenario: 'Someone commits a nonviolent crime. What\'s the right response?',
      options: [
        { id: 'v_justice_a', text: 'Consistent punishment \u2014 the law is the law, no exceptions', valueId: 'conformity' },
        { id: 'v_justice_b', text: 'Focus on rehabilitation and getting them the help they need', valueId: 'benevolence' },
        { id: 'v_justice_c', text: 'Whatever makes the community safest, including monitoring after release', valueId: 'security' },
        { id: 'v_justice_d', text: 'Minimize government involvement \u2014 keep people out of the system when possible', valueId: 'self_direction' },
      ],
    },
  ],
};

/**
 * Derive synthetic AssessmentItems from vignettes.
 * Each vignette option becomes one item with weight 1.
 * Used by the scoring algorithm to score vignette picks as synthetic Likert responses.
 */
export function getVignetteItems(): AssessmentItem[] {
  const items: AssessmentItem[] = [];
  for (const vignette of schwartzSpec.vignettes) {
    for (const option of vignette.options) {
      items.push({
        id: option.id,
        text: option.text,
        valueId: option.valueId,
        weight: 1,
        reversed: false,
      });
    }
  }
  return items;
}

// Helper to get value by ID
export function getValueById(id: string): SchwartzValue | undefined {
  return schwartzSpec.values.find((v) => v.id === id);
}

// Helper to get dimension by ID
export function getDimensionById(id: string): SchwartzDimension | undefined {
  return schwartzSpec.dimensions.find((d) => d.id === id);
}
