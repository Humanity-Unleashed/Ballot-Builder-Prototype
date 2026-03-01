/**
 * Ballot IDs
 *
 * Constants for ballot, contest, and measure identifiers.
 */

export const ELECTION_ID = 'sample-2025-general';

export const BALLOT_IDS = {
  SAMPLE: 'sample-ballot-2025',
  MI_UP_2026: 'mi-up-2026-general',
  GA_2026: 'ga-2026-general',
  NC_2026: 'nc-2026-general',
  TX_2026: 'tx-2026-general',
} as const;

export const CONTEST_IDS = {
  MAYOR: 'mayor',
  COUNCIL_D5: 'council_d5',
  MI_US_SENATE: 'mi_us_senate',
  MI_SENATE_D38: 'mi_senate_d38',
  GA_HOUSE_06: 'GA-06-US-HOUSE-2026',
  GA_US_SENATE: 'GA-US-SENATE-2026',
  GA_GOVERNOR: 'GA-GOVERNOR-2026',
  NC_US_SENATE: 'NC-US-SENATE-2026',
  NC_HOUSE_02: 'NC-02-US-HOUSE-2026',
  NC_SENATE_D8: 'NC-STATE-SENATE-D8-2026',
  TX_US_SENATE: 'TX-US-SENATE-2026',
  TX_HOUSE_34: 'TX-US-HOUSE-34-2026',
  TX_GOVERNOR: 'TX-GOVERNOR-2026',
  TX_AG: 'TX-AG-2026',
  TX_HOUSE_28: 'TX-28-US-HOUSE-2026',
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
  GA_CONSERVATION_USE: 'ga-2026-conservation-use-acreage',
  NC_VOTER_ID: 'nc-2026-voter-id-amendment',
} as const;
