/**
 * Contest Data
 *
 * Candidate race definitions for the ballot.
 */

import type { Contest } from '../../types';
import { CONTEST_IDS } from './ids';
import { candidatesGovernor, candidatesStateSenate } from './candidates';

export const contests: Contest[] = [
  {
    id: CONTEST_IDS.GOVERNOR,
    type: 'candidate',
    office: 'Governor',
    jurisdiction: 'state',
    votingFor: 1,
    candidates: candidatesGovernor,
  },
  {
    id: CONTEST_IDS.STATE_SENATE_D10,
    type: 'candidate',
    office: 'State Senate District 10',
    jurisdiction: 'state',
    votingFor: 1,
    candidates: candidatesStateSenate,
  },
];

export function getContestById(contestId: string): Contest | null {
  return contests.find((c) => c.id === contestId) || null;
}

export function getAllContests(): Contest[] {
  return contests;
}
