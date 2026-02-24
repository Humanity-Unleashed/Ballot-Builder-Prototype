/**
 * Candidate Data
 *
 * Fake candidates for prototype ballot.
 * Data aligned with frontend mock data.
 */

import type { Candidate } from '../../types';
import { CONTEST_IDS } from './ids';

// CANDIDATE PROFILES: Values 0-10 where:
// - LOW (0-4) = leans toward poleA
// - HIGH (6-10) = leans toward poleB
// These are compared directly to user slider values

// Schwartz Value Stances: -1 to +1 where:
// - Positive = candidate emphasizes/aligns with that value
// - Negative = candidate de-emphasizes/conflicts with that value
// Values: universalism, benevolence, tradition, conformity, security, power, achievement, hedonism, stimulation, self_direction

// ============================================
// Candidates - Mayor
// ============================================

export const candidatesMayor: Candidate[] = [
  {
    id: 'martinez',
    contestId: CONTEST_IDS.MAYOR,
    name: { full: 'Elena Martinez', ballotDisplay: 'Elena Martinez' },
    party: 'Democratic',
    incumbencyStatus: 'incumbent',
    ballotOrder: 1,
    positions: [
      'Prioritizes affordable housing expansion',
      'Supports transit expansion and climate action',
      'Advocates for civilian oversight of police',
      'Focused on tenant protections',
    ],
    // Low values = poleA positions
    axisStances: {
      econ_investment: 2,                   // poleA: More public investment
      econ_safetynet: 3,                    // poleA: Broader safety net
      housing_affordability_tools: 2,       // poleA: Rent limits & public housing
      housing_supply_zoning: 3,             // poleA: Build more / allow density
      climate_ambition: 2,                  // poleA: Act fast on climate
      justice_policing_accountability: 3,   // poleA: More oversight & alternatives
    },
    // Progressive values profile: caring for community, environment, equality
    valueStances: {
      universalism: 0.8,    // Strong focus on equality and environment
      benevolence: 0.7,     // Community-focused policies
      self_direction: 0.4,  // Supports diverse communities
      stimulation: 0.3,     // Open to new approaches
      security: 0.2,        // Housing stability for vulnerable
      conformity: -0.3,     // Willing to challenge status quo
      power: -0.5,          // Skeptical of concentrated power
    },
    profileSummary: 'Prioritizes affordable housing, transit expansion, and climate action. Supports civilian oversight of police.',
  },
  {
    id: 'thompson',
    contestId: CONTEST_IDS.MAYOR,
    name: { full: 'David Thompson', ballotDisplay: 'David Thompson' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    positions: [
      'Focus on fiscal responsibility',
      'Prioritizes public safety and policing',
      'Reduces regulations on businesses',
      'Market-based housing solutions',
    ],
    // High values = poleB positions
    axisStances: {
      econ_investment: 8,                   // poleB: Lower taxes/tighter budgets
      econ_safetynet: 7,                    // poleB: More conditional safety net
      housing_affordability_tools: 8,       // poleB: Build more, fewer rules
      housing_supply_zoning: 7,             // poleB: Preserve / limit growth
      climate_ambition: 8,                  // poleB: Go slow, keep costs low
      justice_policing_accountability: 8,   // poleB: More police & enforcement
    },
    // Conservative values profile: security, order, achievement, tradition
    valueStances: {
      security: 0.8,        // Strong law and order focus
      conformity: 0.7,      // Respect for rules and authority
      power: 0.6,           // Business success, economic power
      achievement: 0.6,     // Personal responsibility
      tradition: 0.5,       // Traditional approaches
      self_direction: 0.3,  // Economic freedom
      universalism: -0.4,   // Less focus on collective welfare
      benevolence: -0.2,    // Conditional support programs
    },
    profileSummary: 'Focuses on fiscal responsibility, public safety, and reducing regulations on businesses and housing development.',
  },
  {
    id: 'patel',
    contestId: CONTEST_IDS.MAYOR,
    name: { full: 'Priya Patel', ballotDisplay: 'Priya Patel' },
    party: 'Independent',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    positions: [
      'Pro-housing centrist',
      'Supports building more at all price points',
      'Pragmatic approach to climate',
      'Balanced policing strategy',
    ],
    axisStances: {
      econ_investment: 5,                   // Balanced
      econ_safetynet: 5,                    // Balanced
      housing_affordability_tools: 6,       // Slight lean to market solutions (poleB)
      housing_supply_zoning: 2,             // Strong pro-building (poleA)
      climate_ambition: 4,                  // Moderate climate action (slight poleA)
      justice_policing_accountability: 5,   // Balanced approach
    },
    // Centrist values profile: pragmatic, achievement-oriented, moderate on all
    valueStances: {
      achievement: 0.6,     // Results-oriented
      self_direction: 0.5,  // Independent thinking
      stimulation: 0.4,     // Open to innovation
      universalism: 0.3,    // Moderate concern for all
      benevolence: 0.3,     // Community-minded
      security: 0.3,        // Balanced stability
      conformity: 0.0,      // Neutral on rules
      tradition: -0.2,      // Willing to try new approaches
    },
    profileSummary: 'Pro-housing centrist who supports building more at all price points. Pragmatic on climate and policing.',
  },
];

// ============================================
// Candidates - City Council District 5
// ============================================

export const candidatesCouncilD5: Candidate[] = [
  {
    id: 'nguyen',
    contestId: CONTEST_IDS.COUNCIL_D5,
    name: { full: 'Kevin Nguyen', ballotDisplay: 'Kevin Nguyen' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    positions: [
      'YIMBY advocate focused on housing production',
      'Supports upzoning and streamlined permitting',
      'Favors public investment in infrastructure',
      'Leans toward police oversight',
    ],
    axisStances: {
      econ_investment: 3,                   // poleA: More public investment
      housing_supply_zoning: 1,             // Strong poleA: Build more / allow density
      housing_affordability_tools: 4,       // Mixed - slight poleA
      justice_policing_accountability: 4,   // Slight poleA: Leans oversight
    },
    // YIMBY values: innovation, self-direction, achievement, some universalism
    valueStances: {
      self_direction: 0.7,  // Independent housing choices
      achievement: 0.6,     // Building, progress
      stimulation: 0.5,     // New development, change
      universalism: 0.4,    // Housing for all
      benevolence: 0.3,     // Community investment
      tradition: -0.5,      // Willing to change neighborhoods
      conformity: -0.3,     // Challenges NIMBY status quo
    },
    profileSummary: 'YIMBY advocate focused on housing production. Supports upzoning and streamlined permitting.',
  },
  {
    id: 'oconnor',
    contestId: CONTEST_IDS.COUNCIL_D5,
    name: { full: "Sarah O'Connor", ballotDisplay: "Sarah O'Connor" },
    party: 'Democratic',
    incumbencyStatus: 'incumbent',
    ballotOrder: 2,
    positions: [
      'Tenant rights champion',
      'Prioritizes rent stabilization',
      'Supports community land trusts',
      'Strong advocate for police oversight',
    ],
    axisStances: {
      econ_investment: 2,                   // poleA: More public investment
      housing_supply_zoning: 5,             // Balanced on density
      housing_affordability_tools: 1,       // Strong poleA: Rent limits
      justice_policing_accountability: 2,   // poleA: Strong oversight advocate
    },
    // Progressive tenant advocate: universalism, benevolence, security for vulnerable
    valueStances: {
      universalism: 0.8,    // Protecting vulnerable tenants
      benevolence: 0.7,     // Community support
      security: 0.5,        // Housing stability
      conformity: 0.2,      // Following fair rules
      self_direction: -0.2, // Limits landlord freedom for tenant protection
      power: -0.6,          // Challenges landlord power
      achievement: -0.3,    // Prioritizes protection over profit
    },
    profileSummary: "Tenant rights champion. Prioritizes rent stabilization and community land trusts over market-rate development.",
  },
  {
    id: 'brooks',
    contestId: CONTEST_IDS.COUNCIL_D5,
    name: { full: 'Michael Brooks', ballotDisplay: 'Michael Brooks' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    positions: [
      'Neighborhood preservation advocate',
      'Opposes density increases',
      'Supports traditional policing',
      'Favors lower taxes',
    ],
    axisStances: {
      econ_investment: 8,                   // poleB: Lower taxes
      housing_supply_zoning: 7,             // poleB: Preserve neighborhoods
      housing_affordability_tools: 9,       // poleB: No rent control
      justice_policing_accountability: 9,   // poleB: Pro-police
    },
    // Conservative neighborhood advocate: tradition, security, conformity
    valueStances: {
      tradition: 0.8,       // Preserve neighborhood character
      security: 0.8,        // Law and order, stable neighborhoods
      conformity: 0.7,      // Following established rules
      power: 0.5,           // Property rights
      achievement: 0.4,     // Property values, fiscal responsibility
      stimulation: -0.6,    // Resists change and development
      universalism: -0.5,   // Less focus on broader needs
      self_direction: -0.3, // Prefers established norms
    },
    profileSummary: 'Neighborhood preservation advocate. Opposes density increases and supports traditional policing.',
  },
];

// ============================================
// Candidates - MI U.S. Senate 2026
// Real-world data scored from public sources (Feb 2026)
// Open seat — Gary Peters (D) retiring
// ============================================

export const candidatesMIUSSenate: Candidate[] = [
  {
    id: 'stevens',
    contestId: CONTEST_IDS.MI_US_SENATE,
    name: { full: 'Haley Stevens', ballotDisplay: 'Haley Stevens' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    positions: [
      'Supports ACA expansion and a public option, not Medicare for All',
      'Champions manufacturing investment and workforce development; CHIPS Act advocate',
      'Calls for ICE overhaul with accountability, not abolition',
      'Strong environmental record: LCV 100% (2024), 98% lifetime score in Congress',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 2,
      econ_school_choice: 3,
      health_coverage_model: 3,
      health_cost_control: 3,
      health_public_health: 2,
      justice_policing_accountability: 4,
      justice_firearms: 3,
      climate_ambition: 1,
      climate_energy_portfolio: 2,
      climate_permitting: 3,
    },
    valueStances: {
      universalism: 0.6,
      benevolence: 0.6,
      tradition: 0.1,
      conformity: 0.4,
      security: 0.4,
      power: 0.3,
      achievement: 0.5,
      hedonism: 0.1,
      stimulation: 0.3,
      self_direction: 0.3,
    },
    profileSummary: 'Four-term centrist congresswoman with a manufacturing and clean energy focus; establishment-backed with the strongest environmental voting record in the race.',
  },
  {
    id: 'mcmorrow',
    contestId: CONTEST_IDS.MI_US_SENATE,
    name: { full: 'Mallory McMorrow', ballotDisplay: 'Mallory McMorrow' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    positions: [
      'Authored Michigan\'s first red flag gun law; wants to take it national',
      'Supports public option for healthcare; opposes Medicare for All as immediate goal',
      'Passed $15/hr minimum wage, repealed Michigan\'s 1931 abortion ban, expanded affordable housing',
      'Calls for new Democratic leadership in Washington; positions herself as next-generation leader',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 2,
      econ_school_choice: 2,
      health_coverage_model: 3,
      health_cost_control: 3,
      health_public_health: 2,
      housing_supply_zoning: 2,
      housing_affordability_tools: 2,
      housing_transport_priority: 3,
      justice_firearms: 2,
      climate_ambition: 2,
      climate_energy_portfolio: 2,
    },
    valueStances: {
      universalism: 0.7,
      benevolence: 0.8,
      tradition: -0.1,
      conformity: 0.2,
      security: 0.4,
      power: 0.1,
      achievement: 0.4,
      hedonism: 0.2,
      stimulation: 0.5,
      self_direction: 0.5,
    },
    profileSummary: 'State Senate Majority Whip who became a national Democratic figure; pragmatic progressive with a strong legislative record on gun safety, housing, wages, and reproductive rights.',
  },
  {
    id: 'el-sayed',
    contestId: CONTEST_IDS.MI_US_SENATE,
    name: { full: 'Abdul El-Sayed', ballotDisplay: 'Abdul El-Sayed' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    positions: [
      'Signature issue: Medicare for All — guaranteed government health insurance, no premiums or deductibles',
      'Accepts no PAC donations; runs an all-individual-donation campaign',
      'Endorsed by Bernie Sanders; the most progressive major candidate in the race',
      'Critical of Israeli military conduct in Gaza; generally skeptical of U.S. military aid abroad',
    ],
    axisStances: {
      econ_safetynet: 1,
      econ_investment: 1,
      econ_school_choice: 2,
      health_coverage_model: 0,
      health_cost_control: 0,
      health_public_health: 1,
      justice_policing_accountability: 3,
      justice_firearms: 2,
      climate_ambition: 1,
    },
    valueStances: {
      universalism: 0.9,
      benevolence: 0.9,
      tradition: -0.3,
      conformity: -0.1,
      security: 0.5,
      power: -0.5,
      achievement: 0.3,
      hedonism: 0.1,
      stimulation: 0.6,
      self_direction: 0.3,
    },
    profileSummary: 'Physician, epidemiologist, and former public health director; the most progressive major candidate, defined by Medicare for All advocacy and a no-PAC-money pledge.',
  },
  {
    id: 'rogers',
    contestId: CONTEST_IDS.MI_US_SENATE,
    name: { full: 'Mike Rogers', ballotDisplay: 'Mike Rogers' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 4,
    positions: [
      'Voted repeatedly against the ACA and for Medicare vouchers; opposes government drug price negotiation',
      'NRA A-rated throughout career; opposed all major gun safety legislation',
      'LCV lifetime score 8%; 14-year record of opposing environmental protections',
      'Supports Trump\'s tariffs and border wall; backs increased immigration enforcement',
    ],
    axisStances: {
      econ_safetynet: 8,
      econ_investment: 8,
      econ_school_choice: 9,
      health_coverage_model: 9,
      health_cost_control: 8,
      health_public_health: 7,
      justice_policing_accountability: 8,
      justice_sentencing_goals: 7,
      justice_firearms: 9,
      climate_ambition: 9,
      climate_energy_portfolio: 8,
      climate_permitting: 8,
    },
    valueStances: {
      universalism: -0.4,
      benevolence: 0.3,
      tradition: 0.6,
      conformity: 0.7,
      security: 0.8,
      power: 0.6,
      achievement: 0.6,
      hedonism: 0.0,
      stimulation: 0.1,
      self_direction: 0.5,
    },
    profileSummary: 'Former 14-term congressman, FBI agent, and Army veteran who nearly won Michigan\'s Senate seat in 2024; backed by Senate Republican leadership with a consistently conservative record across all major policy areas.',
  },
];

// ============================================
// Candidates - MI State Senate District 38
// Real-world data scored from public sources (Feb 2026)
// ============================================

export const candidatesMISenateD38: Candidate[] = [
  {
    id: 'vanginhoven',
    contestId: CONTEST_IDS.MI_SENATE_D38,
    name: { full: 'Kelli van Ginhoven', ballotDisplay: 'Kelli van Ginhoven' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 1,
    positions: [
      'Supports unions and collective bargaining for UP workers',
      'Advocates for state-funded housing solutions and wage increases in the UP',
      'Serves on Opioid Task Force; supports prevention-focused public health approach',
      'Wants UP communities to have stronger representation and resources in Lansing',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 2,
      health_public_health: 2,
      housing_affordability_tools: 3,
      housing_supply_zoning: 4,
      climate_ambition: 3,
    },
    valueStances: {
      universalism: 0.6,
      benevolence: 0.8,
      tradition: 0.2,
      conformity: 0.3,
      security: 0.4,
      power: 0.1,
      achievement: 0.4,
      hedonism: 0.0,
      stimulation: 0.2,
      self_direction: 0.3,
    },
    profileSummary: 'Delta County Commissioner and small business owner running on a pro-union, community-investment platform for the Upper Peninsula.',
  },
  {
    id: 'mapps',
    contestId: CONTEST_IDS.MI_SENATE_D38,
    name: { full: 'Chris Mapps', ballotDisplay: 'Chris Mapps' },
    party: 'Democratic',
    incumbencyStatus: 'challenger',
    ballotOrder: 2,
    positions: [
      'Wants good-paying jobs to stay in UP communities rather than be lost to corporate tax breaks',
      'Supports expanding rural healthcare access so UP residents don\'t face long drives for care',
      'Committed to protecting and expanding veterans\' services in the region',
      'Advocates for fair wages, collective bargaining, and workers\' rights through union background',
    ],
    axisStances: {
      econ_safetynet: 2,
      econ_investment: 2,
      health_coverage_model: 2,
      health_public_health: 3,
      climate_ambition: 4,
    },
    valueStances: {
      universalism: 0.5,
      benevolence: 0.9,
      tradition: 0.3,
      conformity: 0.5,
      security: 0.7,
      power: 0.2,
      achievement: 0.5,
      hedonism: 0.0,
      stimulation: 0.1,
      self_direction: 0.3,
    },
    profileSummary: 'Army combat veteran and AFGE union representative running on a working-class platform emphasizing rural healthcare, veterans\' services, and keeping jobs in the UP.',
  },
  {
    id: 'lafave',
    contestId: CONTEST_IDS.MI_SENATE_D38,
    name: { full: 'Beau LaFave', ballotDisplay: 'Beau LaFave' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 3,
    positions: [
      'Strongly pro-2nd Amendment; open-carried at State of the State address in protest of gun proposals',
      'Opposed COVID mandates; sued Gov. Whitmer over lockdowns and won at the Michigan Supreme Court',
      'Supports school choice; endorsed by Great Lakes Education Project',
      'Supports keeping Line 5 pipeline open for UP energy reliability; Michigan LCV score 35%',
    ],
    axisStances: {
      econ_safetynet: 7,
      econ_investment: 7,
      econ_school_choice: 8,
      health_coverage_model: 7,
      health_public_health: 8,
      justice_policing_accountability: 7,
      justice_sentencing_goals: 7,
      justice_firearms: 10,
      climate_ambition: 8,
      climate_energy_portfolio: 7,
      climate_permitting: 7,
    },
    valueStances: {
      universalism: -0.3,
      benevolence: 0.3,
      tradition: 0.7,
      conformity: 0.4,
      security: 0.5,
      power: 0.5,
      achievement: 0.6,
      hedonism: 0.2,
      stimulation: 0.2,
      self_direction: 0.8,
    },
    profileSummary: 'Former three-term state representative and licensed attorney with a strong conservative record; known for aggressive 2nd Amendment advocacy and opposition to COVID mandates.',
  },
  {
    id: 'prestin',
    contestId: CONTEST_IDS.MI_SENATE_D38,
    name: { full: 'David Prestin', ballotDisplay: 'Dave Prestin' },
    party: 'Republican',
    incumbencyStatus: 'challenger',
    ballotOrder: 4,
    positions: [
      'Strong pro-2A record; supports constitutional carry for law-abiding citizens',
      'Committed to limiting government growth and opposing regulations that harm UP businesses and families',
      'Wants to solve law enforcement and first-responder staffing shortages',
      'Pro-life; endorsed by Right to Life of Michigan; Michigan LCV score 14%',
    ],
    axisStances: {
      econ_safetynet: 7,
      econ_investment: 7,
      econ_school_choice: 8,
      health_coverage_model: 7,
      health_public_health: 8,
      justice_policing_accountability: 8,
      justice_sentencing_goals: 7,
      justice_firearms: 9,
      climate_ambition: 9,
      climate_energy_portfolio: 8,
      climate_permitting: 8,
    },
    valueStances: {
      universalism: -0.3,
      benevolence: 0.4,
      tradition: 0.6,
      conformity: 0.5,
      security: 0.7,
      power: 0.4,
      achievement: 0.6,
      hedonism: 0.1,
      stimulation: 0.1,
      self_direction: 0.7,
    },
    profileSummary: 'Current state representative and former paramedic/firefighter with a strongly conservative record; focused on limiting government growth and public safety staffing.',
  },
];

// ============================================
// All Candidates
// ============================================

export const allCandidates: Candidate[] = [
  ...candidatesMayor,
  ...candidatesCouncilD5,
  ...candidatesMIUSSenate,
  ...candidatesMISenateD38,
];

export function getCandidateById(candidateId: string): Candidate | null {
  return allCandidates.find((c) => c.id === candidateId) || null;
}

export function getCandidatesByContest(contestId: string): Candidate[] {
  return allCandidates.filter((c) => c.contestId === contestId);
}
