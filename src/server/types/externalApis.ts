/**
 * External API Response Types
 *
 * Typed interfaces for Google Civic Information, Ballotpedia, and VoteAmerica APIs.
 */

// ============================================
// Google Civic Information API
// ============================================

export interface GoogleCivicAddress {
  locationName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface GoogleCivicPollingLocation {
  address: GoogleCivicAddress;
  notes?: string;
  pollingHours?: string;
  name?: string;
  sources?: Array<{ name: string; official: boolean }>;
}

export interface GoogleCivicElection {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

export interface GoogleCivicContest {
  type: string;
  office?: string;
  level?: string[];
  roles?: string[];
  district?: {
    name: string;
    scope: string;
    id: string;
  };
  candidates?: Array<{
    name: string;
    party?: string;
    candidateUrl?: string;
    channels?: Array<{ type: string; id: string }>;
  }>;
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumText?: string;
  referendumProStatement?: string;
  referendumConStatement?: string;
}

export interface GoogleCivicVoterInfoResponse {
  election: GoogleCivicElection;
  normalizedInput?: GoogleCivicAddress;
  pollingLocations?: GoogleCivicPollingLocation[];
  earlyVoteSites?: GoogleCivicPollingLocation[];
  dropOffLocations?: GoogleCivicPollingLocation[];
  contests?: GoogleCivicContest[];
  state?: Array<{
    name: string;
    electionAdministrationBody?: {
      name?: string;
      electionInfoUrl?: string;
      electionRegistrationUrl?: string;
      electionRegistrationConfirmationUrl?: string;
      absenteeVotingInfoUrl?: string;
      votingLocationFinderUrl?: string;
      ballotInfoUrl?: string;
    };
  }>;
}

/**
 * Google Civic Information API — Divisions by Address
 * Replacement for the retired Representatives API (turned down April 2025).
 * Returns OCD division IDs for a given address.
 */
export interface GoogleCivicDivisionsByAddressResponse {
  normalizedInput?: GoogleCivicAddress;
  kind: string;
  divisions: Record<string, {
    name: string;
    alsoKnownAs?: string[];
  }>;
}

// ============================================
// Ballotpedia API
// ============================================

export interface BallotpediaCandidate {
  id: number;
  name: string;
  party?: string;
  is_incumbent?: boolean;
  candidate_url?: string;
  person_id?: number;
}

export interface BallotpediaRace {
  id: number;
  office: string;
  office_level: string;
  office_branch?: string;
  office_district?: string;
  is_primary?: boolean;
  is_runoff?: boolean;
  is_general?: boolean;
  candidates: BallotpediaCandidate[];
  url?: string;
}

export interface BallotpediaMeasure {
  id: number;
  title: string;
  description?: string;
  status?: string;
  type?: string;
  url?: string;
  yes_vote?: string;
  no_vote?: string;
}

export interface BallotpediaElection {
  id: number;
  date: string;
  type: string;
  description?: string;
  races: BallotpediaRace[];
  measures: BallotpediaMeasure[];
}

export interface BallotpediaElectionByPointResponse {
  success: boolean;
  data: {
    elections: BallotpediaElection[];
  };
}

// ============================================
// VoteAmerica Civic Data API
// ============================================

export interface VoteAmericaStateRules {
  state_code: string;
  state_name: string;
  registration_deadline_in_person?: string;
  registration_deadline_by_mail?: string;
  registration_deadline_online?: string;
  id_requirements_to_vote?: string;
  id_requirements_to_register?: string;
  absentee_ballot_rules?: string;
  early_voting_starts?: string;
  early_voting_ends?: string;
  election_day_registration?: boolean;
  automatic_voter_registration?: boolean;
  voter_registration_url?: string;
  absentee_ballot_url?: string;
  election_information_url?: string;
  polling_place_url?: string;
}

// ============================================
// Pipeline Internal Types
// ============================================

export interface DistrictInfo {
  state: string;
  county?: string;
  city?: string;
  ocdDivisionIds: string[];
  lat?: number;
  lng?: number;
}

export interface BallotLookupResult {
  ballot: import('../types').Ballot;
  source: 'cache' | 'live' | 'static_fallback';
  fetchedAt?: string;
  voterInfo?: {
    registrationUrl?: string;
    absenteeBallotUrl?: string;
    pollingPlaceUrl?: string;
    stateRules?: VoteAmericaStateRules;
  } | null;
}
