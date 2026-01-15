/**
 * Candidate Data
 *
 * Fake candidates for prototype ballot.
 */

import type { Candidate } from '../../types';
import { CONTEST_IDS } from './ids';

// ============================================
// Candidates - Governor
// ============================================

export const candidatesGovernor: Candidate[] = [
  {
    id: 'cand_gov_jane_smith',
    contestId: CONTEST_IDS.GOVERNOR,
    name: { full: 'Jane Smith', ballotDisplay: 'Jane Smith' },
    party: 'Democratic',
    ballotOrder: 1,
    vector: [0.7, 0.6, 0.8, 0.7, 0.6],
    positions: [
      'Support universal healthcare expansion',
      'Invest $50B in clean energy infrastructure',
      'Increase education funding by 20%',
      'Criminal justice reform with focus on rehabilitation',
    ],
  },
  {
    id: 'cand_gov_john_doe',
    contestId: CONTEST_IDS.GOVERNOR,
    name: { full: 'John Doe', ballotDisplay: 'John Doe' },
    party: 'Republican',
    ballotOrder: 2,
    vector: [0.3, 0.4, 0.2, 0.3, 0.4],
    positions: [
      'Promote healthcare market competition',
      'Balance energy independence with environmental concerns',
      'Support school choice and voucher programs',
      'Maintain law and order with strong policing',
    ],
  },
  {
    id: 'cand_gov_sarah_johnson',
    contestId: CONTEST_IDS.GOVERNOR,
    name: { full: 'Sarah Johnson', ballotDisplay: 'Sarah Johnson' },
    party: 'Independent',
    ballotOrder: 3,
    vector: [0.5, 0.5, 0.6, 0.5, 0.7],
    positions: [
      'Mixed public-private healthcare approach',
      'Gradual transition to renewable energy',
      'Education reform with accountability measures',
      'Balanced approach to criminal justice',
    ],
  },
];

// ============================================
// Candidates - State Senate District 10
// ============================================

export const candidatesStateSenate: Candidate[] = [
  {
    id: 'cand_senate_maria_garcia',
    contestId: CONTEST_IDS.STATE_SENATE_D10,
    name: { full: 'Maria Garcia', ballotDisplay: 'Maria Garcia' },
    party: 'Democratic',
    ballotOrder: 1,
    vector: [0.8, 0.7, 0.75, 0.8, 0.7],
    positions: [
      'Expand healthcare access to undocumented immigrants',
      'Fast-track renewable energy projects',
      'Increase minimum wage to $20/hour',
      'Support rent control measures',
    ],
  },
  {
    id: 'cand_senate_robert_chen',
    contestId: CONTEST_IDS.STATE_SENATE_D10,
    name: { full: 'Robert Chen', ballotDisplay: 'Robert Chen' },
    party: 'Republican',
    ballotOrder: 2,
    vector: [0.4, 0.5, 0.3, 0.4, 0.5],
    positions: [
      'Reduce business regulations to encourage growth',
      'Support traditional energy alongside renewables',
      'Oppose mandated minimum wage increases',
      'Protect property owner rights',
    ],
  },
];

// ============================================
// All Candidates
// ============================================

export const allCandidates: Candidate[] = [
  ...candidatesGovernor,
  ...candidatesStateSenate,
];

export function getCandidateById(candidateId: string): Candidate | null {
  return allCandidates.find((c) => c.id === candidateId) || null;
}

export function getCandidatesByContest(contestId: string): Candidate[] {
  return allCandidates.filter((c) => c.contestId === contestId);
}
