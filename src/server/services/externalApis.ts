/**
 * External API Client
 *
 * Functions to call Google Civic Information and Ballotpedia APIs.
 * State voting rules come from curated data (see src/server/data/stateVotingRules.ts).
 */

import axios from 'axios';
import type {
  GoogleCivicVoterInfoResponse,
  GoogleCivicDivisionsByAddressResponse,
  BallotpediaElectionByPointResponse,
  VoteAmericaStateRules,
  FiveCallsResponse,
} from '../types/externalApis';
import { getStateVotingRulesOrNull } from '../data/stateVotingRules';
import { STATE_CODE_TO_NAME, getGenericVotingUrls } from '../data/stateConstants';
import { fetchFvapDeadlines } from './fvapClient';

const GOOGLE_CIVIC_BASE = 'https://www.googleapis.com/civicinfo/v2';
const BALLOTPEDIA_BASE = 'https://api4.ballotpedia.org/data';
const FIVE_CALLS_BASE = 'https://api.5calls.org/v1';

const DEFAULT_TIMEOUT = 12000; // 12s

function getGoogleCivicApiKey(): string {
  const key = process.env.GOOGLE_CIVIC_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not configured');
  }
  return key;
}

function getBallotpediaApiKey(): string {
  const key = process.env.BALLOTPEDIA_API_KEY;
  if (!key) {
    throw new Error('BALLOTPEDIA_API_KEY is not configured');
  }
  return key;
}

/** Truncate address for log safety (PII) */
function truncateAddress(address: string): string {
  if (address.length <= 10) return '***';
  return address.slice(0, 5) + '...' + address.slice(-3);
}

/**
 * Google Civic Information API — Voter Info
 * Returns election info, polling locations, and contests for a given address.
 */
export async function getVoterInfo(address: string): Promise<GoogleCivicVoterInfoResponse> {
  const apiKey = getGoogleCivicApiKey();

  console.log(`[externalApis] getVoterInfo for address: ${truncateAddress(address)}`);

  const response = await axios.get<GoogleCivicVoterInfoResponse>(
    `${GOOGLE_CIVIC_BASE}/voterinfo`,
    {
      params: {
        key: apiKey,
        address,
        electionId: 'ocd-election/country:us/2026',
      },
      timeout: DEFAULT_TIMEOUT,
    },
  );

  return response.data;
}

/**
 * Google Civic Information API — Divisions by Address
 * Returns OCD division IDs for a given address/zipcode.
 * Replacement for the retired Representatives API (turned down April 2025).
 * See: https://developers.google.com/civic-information/docs/v2/divisions/divisionsByAddress
 */
export async function getDivisionsByAddress(address: string): Promise<GoogleCivicDivisionsByAddressResponse> {
  const apiKey = getGoogleCivicApiKey();

  console.log(`[externalApis] getDivisionsByAddress for address: ${truncateAddress(address)}`);

  const response = await axios.get<GoogleCivicDivisionsByAddressResponse>(
    `${GOOGLE_CIVIC_BASE}/divisionsByAddress`,
    {
      params: {
        key: apiKey,
        address,
      },
      timeout: DEFAULT_TIMEOUT,
    },
  );

  return response.data;
}

/**
 * Google Maps Geocoding API — Address to lat/lng
 * Uses the same API key as Civic Information.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const apiKey = getGoogleCivicApiKey();

  console.log(`[externalApis] geocodeAddress for address: ${truncateAddress(address)}`);

  const response = await axios.get<{
    results: Array<{
      geometry: {
        location: { lat: number; lng: number };
      };
    }>;
    status: string;
  }>('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      key: apiKey,
      address,
    },
    timeout: DEFAULT_TIMEOUT,
  });

  if (response.data.status !== 'OK' || !response.data.results[0]) {
    throw new Error(`Geocoding failed: ${response.data.status}`);
  }

  return response.data.results[0].geometry.location;
}

/**
 * Ballotpedia API — Elections by point
 * Returns ballot data for a given lat/lng and election date.
 */
export async function getBallotByPoint(
  lat: number,
  lng: number,
  electionDate: string,
): Promise<BallotpediaElectionByPointResponse> {
  const apiKey = getBallotpediaApiKey();

  console.log(`[externalApis] getBallotByPoint at (${lat.toFixed(2)}, ${lng.toFixed(2)}) for ${electionDate}`);

  const response = await axios.get<BallotpediaElectionByPointResponse>(
    `${BALLOTPEDIA_BASE}/elections_by_point`,
    {
      params: {
        lat,
        lng,
        election_date: electionDate,
      },
      headers: {
        'x-api-key': apiKey,
      },
      timeout: 15000,
    },
  );

  return response.data;
}

/**
 * 5 Calls API — Representatives by zipcode
 * Returns federal and state representatives for a given location.
 */
export async function getRepresentativesByZipcode(zipcode: string): Promise<FiveCallsResponse> {
  const apiKey = process.env['5_CALLS_API_KEY'];
  if (!apiKey) {
    throw new Error('5_CALLS_API_KEY is not configured');
  }

  console.log(`[externalApis] getRepresentativesByZipcode for: ${zipcode}`);

  const response = await axios.get<FiveCallsResponse>(
    `${FIVE_CALLS_BASE}/representatives`,
    {
      params: { location: zipcode },
      headers: { 'X-5Calls-Token': apiKey },
      timeout: DEFAULT_TIMEOUT,
    },
  );

  return response.data;
}

/**
 * State voting rules — registration deadlines, ID requirements, absentee rules, etc.
 *
 * 3-tier data sourcing (never throws):
 *   1. Curated data (e.g. Michigan SOS) — instant, highest quality
 *   2. FVAP eVAG XML API — free, all 50 states + DC, registration deadlines
 *   3. Generic fallback — state name + vote.gov URLs only
 */
export async function getVotingRules(stateCode: string): Promise<VoteAmericaStateRules> {
  const code = stateCode.toUpperCase();
  console.log(`[externalApis] getVotingRules for state: ${code}`);

  // Tier 1: Curated data (MI, etc.)
  const curated = getStateVotingRulesOrNull(code);
  if (curated) {
    console.log(`[externalApis] Tier 1 hit (curated) for ${code}`);
    return curated;
  }

  const stateName = STATE_CODE_TO_NAME[code] ?? code;
  const genericUrls = getGenericVotingUrls(code);

  // Tier 2: FVAP API
  try {
    const deadlines = await fetchFvapDeadlines(code);
    console.log(`[externalApis] Tier 2 hit (FVAP) for ${code}`);
    return {
      state_code: code,
      state_name: stateName,
      ...deadlines,
      ...genericUrls,
    };
  } catch (error) {
    console.warn(`[externalApis] FVAP fetch failed for ${code}, falling back to generic:`, error);
  }

  // Tier 3: Generic fallback
  console.log(`[externalApis] Tier 3 (generic) for ${code}`);
  return {
    state_code: code,
    state_name: stateName,
    ...genericUrls,
  };
}
