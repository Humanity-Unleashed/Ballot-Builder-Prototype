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
// All Candidates
// ============================================

export const allCandidates: Candidate[] = [
  ...candidatesMayor,
  ...candidatesCouncilD5,
];

export function getCandidateById(candidateId: string): Candidate | null {
  return allCandidates.find((c) => c.id === candidateId) || null;
}

export function getCandidatesByContest(contestId: string): Candidate[] {
  return allCandidates.filter((c) => c.contestId === contestId);
}
