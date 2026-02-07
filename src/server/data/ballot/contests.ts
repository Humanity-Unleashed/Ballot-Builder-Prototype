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
    termInfo: 'The next mayor will face a housing affordability crisis, rising infrastructure costs, and pressure to meet new climate targets. Key decisions include whether to expand rent protections, how to fund transit improvements, and how to balance public safety spending with community investment.',
    votingFor: 1,
    candidates: candidatesMayor,
  },
  {
    id: CONTEST_IDS.COUNCIL_D5,
    type: 'candidate',
    office: 'City Council - District 5',
    jurisdiction: 'city',
    termInfo: 'District 5 is at the center of the city\'s housing debate. The winning candidate will vote on a proposed upzoning plan, set rules for short-term rentals, and decide whether to fund a new community policing pilot or expand the existing force.',
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
