/**
 * Booster Question Sets
 *
 * Short question sets (3-5 items) that refine the user's value profile
 * for specific emerging topics. Items use the same AssessmentItem interface
 * as baseline items, so scoring works identically.
 */

import type { AssessmentItem } from './spec';

export interface BoosterSet {
  id: string;
  version: number;
  title: string;
  description: string;
  items: AssessmentItem[];
}

export interface BoosterSetMeta {
  id: string;
  version: number;
  title: string;
  description: string;
  itemCount: number;
}

/**
 * All registered booster sets.
 * To add a new booster: append a BoosterSet to this array.
 */
export const boosterSets: BoosterSet[] = [
  {
    id: 'ai_regulation',
    version: 1,
    title: 'AI & Technology Regulation',
    description: 'Answer 3 quick questions about AI policy to refine your recommendations.',
    items: [
      {
        id: 'boost_ai_1',
        text: 'The government should set strict rules on how companies use artificial intelligence.',
        valueId: 'security',
        weight: 1,
        reversed: false,
        tradeoff: { opposingValueId: 'self_direction', opposingWeight: -0.5 },
      },
      {
        id: 'boost_ai_2',
        text: 'AI tools should be freely available to everyone, even if some people misuse them.',
        valueId: 'self_direction',
        weight: 1,
        reversed: false,
        tradeoff: { opposingValueId: 'conformity', opposingWeight: -0.5 },
      },
      {
        id: 'boost_ai_3',
        text: 'Protecting people\u2019s jobs is more important than letting companies automate with AI.',
        valueId: 'benevolence',
        weight: 1,
        reversed: false,
        tradeoff: { opposingValueId: 'achievement', opposingWeight: -0.5 },
      },
    ],
  },
];

/** Get metadata for all booster sets (without full item data). */
export function getBoosterSetsMeta(): BoosterSetMeta[] {
  return boosterSets.map(({ id, version, title, description, items }) => ({
    id,
    version,
    title,
    description,
    itemCount: items.length,
  }));
}

/** Get a single booster set by ID, or undefined. */
export function getBoosterSetById(id: string): BoosterSet | undefined {
  return boosterSets.find((b) => b.id === id);
}

/** Get all booster items across every booster set (flat list). */
export function getAllBoosterItems(): AssessmentItem[] {
  return boosterSets.flatMap((b) => b.items);
}
