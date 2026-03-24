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

// === MICHIGAN 2026 REAL-WORLD MEASURES ===
// Scored from public sources (Feb 2026)

export const michiganMeasures: Measure[] = [
  {
    id: MEASURE_IDS.MI_PROP1_CONCON,
    type: 'measure',
    title: 'Proposal 1: Constitutional Convention Question',
    shortTitle: 'Con-Con Question',
    description:
      'Shall a convention of elected delegates be convened in 2027 to draft a general revision of the State Constitution for presentation to the state\'s voters for their approval or rejection?',
    vector: [0, 0, 0, 0, 0],
    relevantAxes: [],
    yesAxisEffects: {},
    yesValueEffects: {
      tradition: -0.8,
      conformity: -0.5,
      security: -0.4,
      stimulation: 0.7,
      self_direction: 0.3,
      power: 0.1,
      universalism: 0.1,
    },
    outcomes: {
      yes: 'Triggers an election within 6 months to choose 148 delegates (one per House district, one per Senate district). Delegates convene October 2027 to revise or rewrite the Michigan Constitution. Any resulting changes must be ratified by voters in a separate election.',
      no: 'The current 1963 Michigan Constitution remains in effect. The constitutional convention question will not appear on the ballot again until 2042.',
    },
    explanation:
      'An automatic ballot referral required by Michigan\'s constitution every 16 years. A YES vote does not commit Michigan to any specific policy direction — it only empowers elected delegates to propose changes. The convention\'s outcomes are unpredictable and would depend on who is elected as delegates. Voters have rejected this question in 1978, 1994, and 2010. Republican legislative leaders support YES, hoping to revise voter-approved amendments. A bipartisan opposition group warns of a "runaway convention" in a polarized political environment.',
    supporters: ['House Speaker Matt Hall (R)', 'Senate Minority Leader Aric Nesbitt (R)'],
    opponents: ['Protect MI Constitution from Special Interests', 'Lincoln Project (Jeff Timmer)', 'Former Democratic House Leader Dianne Byrum', 'Michigan Democratic Party'],
  },
  {
    id: MEASURE_IDS.MI_INVEST_IN_KIDS,
    type: 'measure',
    title: 'Invest in MI Kids: Graduated Income Tax for Schools',
    shortTitle: 'Invest in MI Kids',
    description:
      'A proposed constitutional amendment that would add a 5% income tax surcharge on income exceeding $500,000 for single filers (or $1,000,000 for joint filers), with revenue constitutionally directed to the School Aid Fund for classroom support, teacher retention, and career and technical education.',
    vector: [0, 0, 0, 0, 0],
    relevantAxes: ['econ_investment', 'econ_safetynet', 'econ_school_choice'],
    yesAxisEffects: {
      econ_investment: -0.7,
      econ_safetynet: -0.3,
      econ_school_choice: -0.4,
    },
    yesValueEffects: {
      universalism: 0.7,
      benevolence: 0.6,
      security: 0.3,
      stimulation: 0.2,
      conformity: 0.1,
      self_direction: -0.3,
      achievement: -0.2,
      power: -0.4,
      tradition: -0.3,
    },
    outcomes: {
      yes: 'Constitutional amendment adds 5% surcharge on income over $500K (single) / $1M (joint). Revenue flows to Michigan\'s School Aid Fund. Michigan would have the highest top income tax rate in the Midwest and 7th highest nationally. Many small and mid-sized businesses filing as pass-through entities would be affected above the thresholds.',
      no: 'Michigan\'s flat 4.25% income tax remains unchanged. School Aid Fund continues at current levels. No structural change to the state\'s tax system.',
    },
    explanation:
      'This proposed constitutional amendment would create Michigan\'s first graduated income tax by adding a 5-point surcharge on the highest earners. Supporters say it would fund smaller class sizes, better teacher pay, and improved school facilities. Critics, including the Michigan Chamber of Commerce and NFIB, argue it would harm small businesses whose income is taxed at individual rates and make Michigan less competitive. The measure is pending ballot certification as of February 2026, with proponents claiming well over the required signatures.',
    supporters: ['Invest in MI Kids coalition', 'Teachers\' unions', 'Tides Foundation', 'BOOM (progressive advocacy)'],
    opponents: ['Michigan Chamber of Commerce', 'Small Business Association of Michigan', 'NFIB', 'Michigan Manufacturers Association'],
  },
];

// === TEXAS 2026 MEASURES ===
// Based on HJR 2 / SB 2 (89th Legislature, 2025) — school voucher constitutional amendment
// Governor Abbott's top priority; passed both chambers in 2025; likely on Nov 2026 ballot

export const texasMeasures: Measure[] = [
  {
    id: MEASURE_IDS.TX_SCHOOL_VOUCHERS,
    type: 'measure',
    title: 'Proposition 1: Education Savings Accounts',
    shortTitle: 'School Vouchers',
    description:
      'The constitutional amendment authorizing the legislature to provide education savings accounts to parents for the education expenses of their children.',
    vector: [0, 0, 0, 0, 0],
    relevantAxes: ['econ_school_choice', 'econ_investment', 'econ_tax_structure'],
    yesAxisEffects: {
      econ_school_choice: 0.9,
      econ_investment: 0.4,
      econ_tax_structure: 0.2,
    },
    yesValueEffects: {
      self_direction: 0.8,
      tradition: 0.5,
      achievement: 0.4,
      universalism: -0.5,
      benevolence: -0.2,
    },
    outcomes: {
      yes: 'Parents could receive ~$10,500 per child per year in state-funded education savings accounts to spend on private school tuition, homeschool materials, tutoring, or other approved education expenses. Public school per-pupil funding would remain, but total enrollment-driven funding could decrease as students leave.',
      no: 'No education savings accounts. Texas public schools continue as the sole recipients of state per-pupil education funding. The legislature could revisit the issue in future sessions.',
    },
    explanation:
      'This proposed constitutional amendment would allow the Texas legislature to create education savings accounts (ESAs) — publicly funded accounts parents can use for private school tuition and other education costs. Governor Abbott made this his top legislative priority, calling it "school choice." Supporters say it empowers parents, especially in underperforming districts. The Texas State Teachers Association and rural Republican legislators have opposed it, arguing it diverts funding from the 5.4 million students in public schools — particularly in rural areas where private alternatives don\'t exist. The fiscal note estimates $2–4 billion in costs over the first biennium depending on uptake.',
    supporters: ['Governor Greg Abbott', 'Lt. Gov. Dan Patrick', 'American Federation for Children', 'Texas Public Policy Foundation'],
    opponents: ['Texas State Teachers Association', 'Texas AFT', 'Rural school districts', 'Texas PTA', 'Multiple rural Republican legislators'],
  },
];

export const allMeasures: Measure[] = [...measures, ...michiganMeasures, ...texasMeasures];

export function getMeasureById(measureId: string): Measure | null {
  return allMeasures.find((m) => m.id === measureId) || null;
}

export function getAllMeasures(): Measure[] {
  return allMeasures;
}
