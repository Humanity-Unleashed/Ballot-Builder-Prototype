/**
 * Ballot IDs
 *
 * Constants for ballot, contest, and measure identifiers.
 */

export const ELECTION_ID = 'sample-2025-general';

export const BALLOT_IDS = {
  SAMPLE: 'sample-ballot-2025',
} as const;

export const CONTEST_IDS = {
  GOVERNOR: 'gov-2025',
  STATE_SENATE_D10: 'state-senate-d10-2025',
} as const;

export const MEASURE_IDS = {
  PROP_42: 'prop-42-education',
  MEASURE_A: 'measure-a-housing',
  PROP_15: 'prop-15-energy',
} as const;
