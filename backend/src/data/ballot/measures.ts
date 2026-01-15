/**
 * Ballot Measures
 *
 * Propositions and ballot measures with yes/no outcomes.
 */

import type { Measure } from '../../types';
import { MEASURE_IDS } from './ids';

export const measures: Measure[] = [
  {
    id: MEASURE_IDS.PROP_42,
    type: 'measure',
    title: 'Proposition 42: Education Funding Act',
    shortTitle: 'Prop 42',
    description:
      'Increases state education funding by implementing a 0.5% sales tax increase dedicated solely to public schools and community colleges',
    vector: [0.3, 0.9, 0.2, 0.6, 0.5],
    outcomes: {
      yes: 'Public schools receive additional $500M annually for teacher salaries, classroom resources, and facility improvements. Community colleges receive $200M for expanded programs.',
      no: 'School funding remains at current levels with no tax increase. Schools must continue operating with existing budgets.',
    },
    explanation:
      "This measure would provide significant additional funding to public education by adding a small sales tax. Supporters argue it's necessary to address teacher shortages and aging facilities. Opponents cite concerns about the regressive nature of sales taxes and accountability for how funds are spent.",
    supporters: ['Teachers Union', 'Education Coalition', 'Parent-Teacher Association'],
    opponents: ['Taxpayer Association', 'Business Council'],
  },
  {
    id: MEASURE_IDS.MEASURE_A,
    type: 'measure',
    title: 'Measure A: Affordable Housing Development',
    shortTitle: 'Measure A',
    description:
      'Allows construction of affordable housing units in single-family residential zones, with income restrictions and design requirements',
    vector: [0.6, 0.4, 0.3, 0.7, 0.8],
    outcomes: {
      yes: 'Up to 1000 new affordable units can be built over 5 years in areas currently zoned for single-family homes. Units must be for households earning below 80% of area median income.',
      no: 'Current zoning restrictions remain in place. No new multi-unit construction allowed in single-family zones.',
    },
    explanation:
      "This measure addresses the housing affordability crisis by allowing more density in residential neighborhoods. It's a trade-off between increasing housing supply to lower costs and maintaining the character of existing neighborhoods. Includes protections for tree canopy and building height limits.",
    supporters: ['Housing Advocates', 'Young Professionals Association', 'Labor Council'],
    opponents: ['Neighborhood Associations', 'Homeowners Coalition'],
  },
  {
    id: MEASURE_IDS.PROP_15,
    type: 'measure',
    title: 'Proposition 15: Clean Energy Initiative',
    shortTitle: 'Prop 15',
    description:
      'Requires 100% renewable energy for all electricity generation by 2035, phases out natural gas power plants',
    vector: [0.2, 0.3, 0.95, 0.4, 0.6],
    outcomes: {
      yes: 'State commits to 100% renewable electricity by 2035. Estimated $30B investment in solar, wind, and battery storage. Natural gas plants shut down on rolling schedule.',
      no: 'Current energy mix continues with gradual renewable adoption at market pace. Maintains flexibility in energy sources.',
    },
    explanation:
      'This ambitious climate measure would make the state a leader in renewable energy but comes with significant upfront costs. Supporters emphasize the urgency of climate action. Critics worry about grid reliability and rate increases for consumers.',
    supporters: ['Environmental Groups', 'Clean Energy Coalition', 'Climate Action Network'],
    opponents: ['Utility Companies', 'Manufacturing Association', 'Rate Payer Advocates'],
  },
];

export function getMeasureById(measureId: string): Measure | null {
  return measures.find((m) => m.id === measureId) || null;
}

export function getAllMeasures(): Measure[] {
  return measures;
}
