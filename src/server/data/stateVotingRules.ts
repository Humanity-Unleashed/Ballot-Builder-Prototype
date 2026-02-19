/**
 * Curated State Voting Rules
 *
 * Real voting rules data sourced from official state election offices.
 * Currently covers Michigan (prototype); add more states as needed.
 *
 * Data sources:
 *   - Michigan SOS: https://www.michigan.gov/sos/elections
 *   - MVIC: https://mvic.sos.state.mi.us/
 *   - Vote.gov: https://vote.gov/register/michigan
 *
 * This module replaces the VoteAmerica Civic Data API (which requires
 * a paid subscription). The data is identical in structure and can be
 * swapped for a live API when a key is available.
 */

import type { VoteAmericaStateRules } from '../types/externalApis';

const STATE_RULES: Record<string, VoteAmericaStateRules> = {
  MI: {
    state_code: 'MI',
    state_name: 'Michigan',
    registration_deadline_in_person: '2026-11-03',
    registration_deadline_by_mail: '2026-10-19',
    registration_deadline_online: '2026-10-19',
    id_requirements_to_vote:
      'Photo ID requested. If you do not have photo ID, you can sign an affidavit and still vote.',
    id_requirements_to_register:
      "Driver's license or state ID number, or last 4 digits of SSN.",
    absentee_ballot_rules:
      'Any registered voter may vote absentee. No excuse required. Michigan voters passed Proposal 3 in 2018 giving every voter the right to vote by mail.',
    early_voting_starts: '2026-10-24',
    early_voting_ends: '2026-11-01',
    election_day_registration: true,
    automatic_voter_registration: true,
    voter_registration_url: 'https://mvic.sos.state.mi.us/RegisterVoter',
    absentee_ballot_url: 'https://mvic.sos.state.mi.us/AVApplication/Index',
    election_information_url: 'https://mvic.sos.state.mi.us/',
    polling_place_url: 'https://mvic.sos.state.mi.us/Voter/Index',
  },
};

/**
 * Look up voting rules for a US state by its 2-letter code.
 * Throws if the state is not in the curated dataset.
 */
export function getStateVotingRules(stateCode: string): VoteAmericaStateRules {
  const normalized = stateCode.toUpperCase();
  const rules = STATE_RULES[normalized];
  if (!rules) {
    throw new Error(
      `Voting rules not available for state: ${normalized}. ` +
        `Currently supported: ${Object.keys(STATE_RULES).join(', ')}`,
    );
  }
  return rules;
}

/**
 * Check whether a state has curated voting rules data.
 */
export function hasStateVotingRules(stateCode: string): boolean {
  return stateCode.toUpperCase() in STATE_RULES;
}

/**
 * List all states that have curated voting rules.
 */
export function getSupportedStates(): string[] {
  return Object.keys(STATE_RULES);
}
