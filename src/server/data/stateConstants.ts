/**
 * US State Code/Name Mappings + Generic Voting URLs
 *
 * All 50 states + DC. Used as fallback when curated data is unavailable.
 */

export const STATE_CODE_TO_NAME: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export const STATE_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name, code]),
);

/**
 * Convert a state name to a URL slug (e.g. "New York" → "new-york").
 */
function stateSlug(stateName: string): string {
  return stateName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Returns generic vote.gov URLs for any state.
 * Used when no state-specific URLs are available.
 */
export function getGenericVotingUrls(stateCode: string): {
  voter_registration_url: string;
  absentee_ballot_url: string;
  election_information_url: string;
  polling_place_url: string;
} {
  const name = STATE_CODE_TO_NAME[stateCode.toUpperCase()];
  const slug = name ? stateSlug(name) : stateCode.toLowerCase();

  return {
    voter_registration_url: `https://vote.gov/register/${slug}`,
    absentee_ballot_url: 'https://www.nass.org/can-i-vote/absentee-early-voting',
    election_information_url: 'https://vote.gov/',
    polling_place_url: 'https://www.nass.org/can-i-vote/find-your-polling-place',
  };
}
