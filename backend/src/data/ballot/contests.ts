/**
 * Contest Data
 *
 * Candidate race definitions for the ballot.
 * Data aligned with frontend mock data.
 */

import type { Contest } from '../../types';
import { CONTEST_IDS } from './ids';
import { candidatesMayor, candidatesCouncilD5 } from './candidates';

export const contests: Contest[] = [
  {
    id: CONTEST_IDS.MAYOR,
    type: 'candidate',
    office: 'Mayor',
    jurisdiction: 'city',
    termInfo: 'The Mayor serves a 4-year term and oversees city operations, proposes the annual budget, and represents the city in regional matters.',
    votingFor: 1,
    candidates: candidatesMayor,
  },
  {
    id: CONTEST_IDS.COUNCIL_D5,
    type: 'candidate',
    office: 'City Council - District 5',
    jurisdiction: 'city',
    termInfo: 'City Council members serve 2-year terms and vote on local ordinances, zoning decisions, and the city budget.',
    votingFor: 1,
    candidates: candidatesCouncilD5,
  },
];

export function getContestById(contestId: string): Contest | null {
  return contests.find((c) => c.id === contestId) || null;
}

export function getAllContests(): Contest[] {
  return contests;
}
