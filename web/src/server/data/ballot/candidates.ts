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
