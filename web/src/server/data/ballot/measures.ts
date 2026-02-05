/**
 * Ballot Measures
 *
 * Propositions and ballot measures with yes/no outcomes.
 * Data aligned with frontend mock data.
 */

import type { Measure } from '../../types';
import { MEASURE_IDS } from './ids';

// IMPORTANT: Polarity explanation for axis effects (legacy)
// - poleA = LOW slider values (0-4), score towards +1
// - poleB = HIGH slider values (6-10), score towards -1
// - NEGATIVE yesAxisEffect = YES aligns with poleA preferences (user with low slider should vote YES)
// - POSITIVE yesAxisEffect = YES aligns with poleB preferences (user with high slider should vote YES)

// Schwartz Value Effects explanation:
// - POSITIVE yesValueEffect = YES aligns with high scores on that value
// - NEGATIVE yesValueEffect = YES conflicts with that value
// Values: universalism, benevolence, tradition, conformity, security, power, achievement, hedonism, stimulation, self_direction

export const measures: Measure[] = [
  // === STATE PROPOSITIONS ===
  {
    id: MEASURE_IDS.PROP_HOUSING_BOND,
    type: 'measure',
    title: 'Proposition 1: Housing Bond',
    shortTitle: 'Prop 1',
    description:
      'Should the state issue $10 billion in bonds to fund affordable housing construction and rental assistance programs?',
    vector: [0.3, 0.9, 0.2, 0.6, 0.5],
    relevantAxes: ['econ_investment', 'housing_affordability_tools', 'econ_safetynet'],
    yesAxisEffects: {
      econ_investment: -0.8,
      housing_affordability_tools: -0.7,
      econ_safetynet: -0.6,
    },
    // Schwartz value effects: YES on housing bond aligns with caring for others
    yesValueEffects: {
      universalism: 0.8,    // Helps ensure equal access to housing
      benevolence: 0.7,     // Helps families in need
      security: 0.5,        // Provides housing stability
      power: -0.3,          // May increase taxes on wealthy
    },
    outcomes: {
      yes: 'This bond would fund construction of 100,000+ affordable units, provide down payment assistance for first-time buyers, and expand rental vouchers for low-income families.',
      no: 'No new bond funding for affordable housing. Current housing programs continue at existing levels without additional state investment.',
    },
    explanation:
      'This bond would fund construction of 100,000+ affordable units, provide down payment assistance for first-time buyers, and expand rental vouchers for low-income families. Repayment would come from state general funds over 30 years.',
    supporters: ['Housing Advocates', 'Labor Council', 'Affordable Housing Coalition'],
    opponents: ['Taxpayer Association', 'Fiscal Responsibility Group'],
  },
  {
    id: MEASURE_IDS.PROP_SCHOOL_CHOICE,
    type: 'measure',
    title: 'Proposition 2: Education Savings Accounts',
    shortTitle: 'Prop 2',
    description:
      'Should parents receive $7,000 per child annually to use at any school, including private and religious schools?',
    vector: [0.6, 0.4, 0.3, 0.7, 0.8],
    relevantAxes: ['econ_school_choice', 'econ_investment'],
    yesAxisEffects: {
      econ_school_choice: 0.9,
      econ_investment: 0.5,
    },
    // Schwartz value effects: YES on school choice emphasizes independence and tradition
    yesValueEffects: {
      self_direction: 0.8,  // Family choice in education
      tradition: 0.5,       // Allows religious school options
      achievement: 0.4,     // Competition may drive excellence
      universalism: -0.5,   // May reduce public school equity
    },
    outcomes: {
      yes: 'Parents receive $7,000 per child annually for any school of their choice, including private and religious schools. Public school funding reduced proportionally.',
      no: 'Current public school funding model continues. No vouchers for private or religious schools.',
    },
    explanation:
      'This measure creates Education Savings Accounts funded by diverting per-pupil state funding. Supporters say it empowers family choice; opponents say it defunds public schools.',
    supporters: ['School Choice Alliance', 'Parent Freedom Coalition', 'Private School Association'],
    opponents: ['Teachers Union', 'Public Education Coalition', 'Parent-Teacher Association'],
  },
  {
    id: MEASURE_IDS.PROP_CLIMATE,
    type: 'measure',
    title: 'Proposition 3: Clean Energy Standard',
    shortTitle: 'Prop 3',
    description:
      'Should utilities be required to generate 100% of electricity from renewable sources by 2035?',
    vector: [0.2, 0.3, 0.95, 0.4, 0.6],
    relevantAxes: ['climate_ambition', 'climate_energy_portfolio'],
    yesAxisEffects: {
      climate_ambition: -0.9,
      climate_energy_portfolio: -0.8,
    },
    // Schwartz value effects: YES on clean energy strongly aligns with universalism
    yesValueEffects: {
      universalism: 0.9,    // Environmental protection for all
      stimulation: 0.4,     // New technology and innovation
      benevolence: 0.3,     // Protecting future generations
      security: -0.3,       // Short-term cost increases
    },
    outcomes: {
      yes: 'State commits to 100% renewable electricity by 2035. Estimated $30B investment in solar, wind, and battery storage. Natural gas plants shut down on rolling schedule.',
      no: 'Current energy mix continues with gradual renewable adoption at market pace. Maintains flexibility in energy sources.',
    },
    explanation:
      'This measure mandates a transition away from fossil fuels for electricity generation. It may increase electricity rates in the short term but aims to reduce emissions and create clean energy jobs.',
    supporters: ['Environmental Groups', 'Clean Energy Coalition', 'Climate Action Network'],
    opponents: ['Utility Companies', 'Manufacturing Association', 'Rate Payer Advocates'],
  },

  // === LOCAL MEASURES ===
  {
    id: MEASURE_IDS.MEASURE_TRANSIT,
    type: 'measure',
    title: 'Measure A: Transit Expansion',
    shortTitle: 'Measure A',
    description:
      'Should the county raise sales tax by 0.5% to fund bus and rail expansion over the next 20 years?',
    vector: [0.4, 0.6, 0.7, 0.5, 0.6],
    relevantAxes: ['housing_transport_priority', 'econ_investment'],
    yesAxisEffects: {
      housing_transport_priority: -0.8,
      econ_investment: -0.6,
    },
    // Schwartz value effects: YES on transit expansion serves community and environment
    yesValueEffects: {
      universalism: 0.7,    // Public good, environmental benefit
      benevolence: 0.6,     // Helps low-income riders
      conformity: 0.3,      // Shared public systems
      self_direction: -0.3, // Less flexibility than car travel
    },
    outcomes: {
      yes: 'Funds would add 3 new rail lines, increase bus frequency, and reduce fares for low-income riders. The tax would add about $50/year for the median household.',
      no: 'No new transit expansion. Current bus and rail service continues at existing levels.',
    },
    explanation:
      'Funds would add 3 new rail lines, increase bus frequency, and reduce fares for low-income riders. The tax would add about $50/year for the median household.',
    supporters: ['Transit Riders Union', 'Environmental Coalition', 'Labor Council'],
    opponents: ['Taxpayer Association', 'Small Business Alliance'],
  },
  {
    id: MEASURE_IDS.MEASURE_RENT,
    type: 'measure',
    title: 'Measure B: Rent Stabilization',
    shortTitle: 'Measure B',
    description:
      'Should annual rent increases be limited to 5% for buildings older than 15 years?',
    vector: [0.7, 0.5, 0.4, 0.8, 0.6],
    relevantAxes: ['housing_affordability_tools', 'housing_supply_zoning'],
    yesAxisEffects: {
      housing_affordability_tools: -0.9,
      housing_supply_zoning: 0.3,
    },
    // Schwartz value effects: YES on rent stabilization protects vulnerable tenants
    yesValueEffects: {
      universalism: 0.7,    // Protects vulnerable populations
      benevolence: 0.6,     // Helps renters stay in homes
      security: 0.5,        // Housing stability for tenants
      self_direction: -0.5, // Limits landlord freedom
      power: -0.4,          // Restricts property owner control
    },
    outcomes: {
      yes: 'Annual rent increases capped at 5% for buildings older than 15 years. Protects existing tenants from large rent hikes.',
      no: 'No rent caps. Landlords can set rents based on market conditions.',
    },
    explanation:
      'This measure caps rent increases to protect existing tenants from displacement. Critics argue it may reduce new housing construction and maintenance investment.',
    supporters: ['Tenant Rights Coalition', 'Housing Justice Alliance', 'Senior Advocates'],
    opponents: ['Property Owners Association', 'Apartment Builders Council', 'Economic Freedom Group'],
  },
  {
    id: MEASURE_IDS.MEASURE_POLICE,
    type: 'measure',
    title: 'Measure C: Public Safety Funding',
    shortTitle: 'Measure C',
    description:
      'Should the city hire 200 additional police officers and increase police department funding by 15%?',
    vector: [0.5, 0.4, 0.3, 0.6, 0.5],
    relevantAxes: ['justice_policing_accountability', 'econ_investment'],
    yesAxisEffects: {
      justice_policing_accountability: 0.8,
      econ_investment: -0.3,
    },
    // Schwartz value effects: YES on police funding emphasizes security and conformity
    yesValueEffects: {
      security: 0.8,        // Safety and crime prevention
      conformity: 0.6,      // Law enforcement and order
      power: 0.4,           // Authority and control
      universalism: -0.4,   // May reduce other social services
      self_direction: -0.3, // More enforcement/authority
    },
    outcomes: {
      yes: '200 additional police officers hired, police department funding increased by 15%. Funds reallocated from other city departments.',
      no: 'Police staffing and funding remain at current levels. No reallocation from other departments.',
    },
    explanation:
      'This measure responds to concerns about crime rates by expanding the police force. It would be funded by reallocating funds from other city departments.',
    supporters: ['Police Officers Association', 'Public Safety Coalition', 'Business Council'],
    opponents: ['Community Justice Alliance', 'Civil Liberties Union', 'Budget Reform Coalition'],
  },
];

export function getMeasureById(measureId: string): Measure | null {
  return measures.find((m) => m.id === measureId) || null;
}

export function getAllMeasures(): Measure[] {
  return measures;
}
