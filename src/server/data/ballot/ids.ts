/**
 * Ballot IDs
 *
 * Constants for ballot, contest, and measure identifiers.
 */

export const ELECTION_ID = 'sample-2025-general';

export const BALLOT_IDS = {
  SAMPLE: 'sample-ballot-2025',
  MI_UP_2026: 'mi-up-2026-general',
} as const;

export const CONTEST_IDS = {
  MAYOR: 'mayor',
  COUNCIL_D5: 'council_d5',
  MI_US_SENATE: 'mi_us_senate',
  MI_SENATE_D38: 'mi_senate_d38',
} as const;

export const MEASURE_IDS = {
  PROP_HOUSING_BOND: 'prop_housing_bond',
  PROP_SCHOOL_CHOICE: 'prop_school_choice',
  PROP_CLIMATE: 'prop_climate',
  MEASURE_TRANSIT: 'measure_transit',
  MEASURE_RENT: 'measure_rent',
  MEASURE_POLICE: 'measure_police',
  MI_PROP1_CONCON: 'mi-2026-prop1-concon',
  MI_INVEST_IN_KIDS: 'mi-2026-invest-in-mi-kids',
} as const;
