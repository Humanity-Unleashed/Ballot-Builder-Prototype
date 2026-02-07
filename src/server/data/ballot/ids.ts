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
  MAYOR: 'mayor',
  COUNCIL_D5: 'council_d5',
} as const;

export const MEASURE_IDS = {
  PROP_HOUSING_BOND: 'prop_housing_bond',
  PROP_SCHOOL_CHOICE: 'prop_school_choice',
  PROP_CLIMATE: 'prop_climate',
  MEASURE_TRANSIT: 'measure_transit',
  MEASURE_RENT: 'measure_rent',
  MEASURE_POLICE: 'measure_police',
} as const;
