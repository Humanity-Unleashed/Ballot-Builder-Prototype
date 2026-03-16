/**
 * Contest Data
 *
 * Candidate race definitions for the ballot.
 * Data aligned with frontend mock data.
 */

import type { Contest } from '../../types';
import { CONTEST_IDS } from './ids';
import { candidatesMayor, candidatesCouncilD5, candidatesMIUSSenate, candidatesMISenateD38 } from './candidates';

export const contests: Contest[] = [
  {
    id: CONTEST_IDS.MAYOR,
    type: 'candidate',
    office: 'Mayor',
    jurisdiction: 'city',
    officeRef: 'city_mayor_generic',
    termInfo: 'The next mayor will face a housing affordability crisis, rising infrastructure costs, and pressure to meet new climate targets. Key decisions include whether to expand rent protections, how to fund transit improvements, and how to balance public safety spending with community investment.',
    votingFor: 1,
    candidates: candidatesMayor,
  },
  {
    id: CONTEST_IDS.COUNCIL_D5,
    type: 'candidate',
    office: 'City Council - District 5',
    jurisdiction: 'city',
    officeRef: 'city_council_member_generic',
    termInfo: 'District 5 is at the center of the city\'s housing debate. The winning candidate will vote on a proposed upzoning plan, set rules for short-term rentals, and decide whether to fund a new community policing pilot or expand the existing force.',
    votingFor: 1,
    candidates: candidatesCouncilD5,
  },
  {
    id: CONTEST_IDS.MI_US_SENATE,
    type: 'candidate',
    office: 'U.S. Senate',
    jurisdiction: 'federal',
    officeRef: 'us_senator_federal',
    termInfo: 'Open seat — incumbent Gary Peters (D) is retiring after two terms. This is a toss-up race (Cook Political Report, Sabato\'s Crystal Ball) that will help determine control of the U.S. Senate. The next senator will vote on healthcare policy, climate legislation, judicial confirmations, immigration reform, and federal spending. Michigan last elected a Republican senator in 1994.',
    votingFor: 1,
    candidates: candidatesMIUSSenate,
  },
  {
    id: CONTEST_IDS.MI_SENATE_D38,
    type: 'candidate',
    office: 'State Senate - District 38',
    jurisdiction: 'state',
    officeRef: 'mi_state_senator',
    termInfo: 'Open seat — incumbent Ed McBroom (R) is term-limited. District 38 covers Michigan\'s Upper Peninsula including Marquette, Delta, Dickinson, Houghton, Menominee, Iron, and more. The next senator will address rural healthcare access, housing shortages, energy policy (including the Line 5 pipeline), and economic development for UP communities.',
    votingFor: 1,
    candidates: candidatesMISenateD38,
  },
];

export function getContestById(contestId: string): Contest | null {
  return contests.find((c) => c.id === contestId) || null;
}

export function getAllContests(): Contest[] {
  return contests;
}
