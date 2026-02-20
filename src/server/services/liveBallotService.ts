/**
 * Live Ballot Service
 *
 * Pipeline orchestrator: zipcode → district resolution → ballot lookup → cache → transform.
 * Falls back to static data on any failure or missing API keys.
 *
 * Three database caches eliminate redundant API calls:
 *   - ZipcodeLookup:   zipcode → district info + lat/lng  (skips Google Reps + Geocoding)
 *   - BallotCache:     district hash + election date → ballot  (skips Ballotpedia)
 *   - VoterInfoCache:  state code → voting rules  (skips VoteAmerica)
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  getDivisionsByAddress,
  geocodeAddress,
  getBallotByPoint,
  getVotingRules,
} from './externalApis';
import {
  computeDistrictHash,
  transformBallotpediaElection,
} from './ballotTransformer';
import { getDefaultBallotData } from './ballotService';
import type {
  DistrictInfo,
  BallotLookupResult,
  VoteAmericaStateRules,
} from '../types/externalApis';
import type { Ballot } from '../types';

const BALLOT_CACHE_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours
const VOTER_INFO_CACHE_STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ZIPCODE_CACHE_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Check whether the live ballot pipeline is available (API keys present).
 */
export function isLiveBallotEnabled(): boolean {
  return !!(process.env.GOOGLE_CIVIC_API_KEY && process.env.BALLOTPEDIA_API_KEY);
}

/**
 * Normalize a zipcode to 5 digits.
 */
export function normalizeZipcode(zipcode: string): string {
  return zipcode.replace(/\D/g, '').slice(0, 5);
}

/**
 * Validate that a string is a 5-digit US zipcode.
 */
export function isValidZipcode(zipcode: string): boolean {
  return /^\d{5}$/.test(normalizeZipcode(zipcode));
}

// ============================================
// Zipcode Lookup Cache
// ============================================

async function getCachedZipcode(zipcode: string): Promise<(DistrictInfo & { districtHash: string }) | null> {
  try {
    const cached = await prisma.zipcodeLookup.findUnique({
      where: { zipcode },
    });
    if (!cached) return null;

    const age = Date.now() - cached.fetchedAt.getTime();
    if (age > ZIPCODE_CACHE_STALE_MS) return null;

    return {
      state: cached.state,
      county: cached.county ?? undefined,
      city: cached.city ?? undefined,
      ocdDivisionIds: cached.ocdDivisionIds as string[],
      lat: cached.lat ?? undefined,
      lng: cached.lng ?? undefined,
      districtHash: cached.districtHash,
    };
  } catch (error) {
    console.warn('[liveBallotService] Zipcode cache lookup failed:', error);
    return null;
  }
}

async function cacheZipcode(
  zipcode: string,
  districtInfo: DistrictInfo,
  districtHash: string,
): Promise<void> {
  try {
    await prisma.zipcodeLookup.upsert({
      where: { zipcode },
      update: {
        state: districtInfo.state,
        county: districtInfo.county ?? null,
        city: districtInfo.city ?? null,
        ocdDivisionIds: districtInfo.ocdDivisionIds as unknown as Prisma.InputJsonValue,
        lat: districtInfo.lat ?? null,
        lng: districtInfo.lng ?? null,
        districtHash,
        fetchedAt: new Date(),
      },
      create: {
        zipcode,
        state: districtInfo.state,
        county: districtInfo.county ?? null,
        city: districtInfo.city ?? null,
        ocdDivisionIds: districtInfo.ocdDivisionIds as unknown as Prisma.InputJsonValue,
        lat: districtInfo.lat ?? null,
        lng: districtInfo.lng ?? null,
        districtHash,
      },
    });
  } catch (error) {
    console.warn('[liveBallotService] Zipcode cache write failed:', error);
  }
}

// ============================================
// Ballot Cache
// ============================================

async function getCachedBallot(
  districtHash: string,
  electionDate: string,
): Promise<{ ballot: Ballot; fetchedAt: Date } | null> {
  try {
    const cached = await prisma.ballotCache.findUnique({
      where: {
        districtHash_electionDate: {
          districtHash,
          electionDate,
        },
      },
    });

    if (!cached) return null;

    const age = Date.now() - cached.fetchedAt.getTime();
    if (age > BALLOT_CACHE_STALE_MS) return null;

    return {
      ballot: cached.rawBallot as unknown as Ballot,
      fetchedAt: cached.fetchedAt,
    };
  } catch (error) {
    console.warn('[liveBallotService] Ballot cache lookup failed:', error);
    return null;
  }
}

async function cacheBallot(
  districtHash: string,
  electionDate: string,
  ballot: Ballot,
): Promise<void> {
  try {
    await prisma.ballotCache.upsert({
      where: {
        districtHash_electionDate: {
          districtHash,
          electionDate,
        },
      },
      update: {
        rawBallot: JSON.parse(JSON.stringify(ballot)) as Prisma.InputJsonValue,
        fetchedAt: new Date(),
      },
      create: {
        districtHash,
        electionDate,
        rawBallot: JSON.parse(JSON.stringify(ballot)) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.warn('[liveBallotService] Ballot cache write failed:', error);
  }
}

// ============================================
// Voter Info Cache
// ============================================

async function getCachedVoterInfo(stateCode: string): Promise<{
  registrationUrl?: string;
  absenteeBallotUrl?: string;
  pollingPlaceUrl?: string;
  stateRules?: VoteAmericaStateRules;
} | null> {
  try {
    const cached = await prisma.voterInfoCache.findUnique({
      where: { stateCode: stateCode.toUpperCase() },
    });
    if (!cached) return null;

    const age = Date.now() - cached.fetchedAt.getTime();
    if (age > VOTER_INFO_CACHE_STALE_MS) return null;

    const rules = cached.rules as unknown as VoteAmericaStateRules;
    return {
      registrationUrl: rules.voter_registration_url,
      absenteeBallotUrl: rules.absentee_ballot_url,
      pollingPlaceUrl: rules.polling_place_url,
      stateRules: rules,
    };
  } catch (error) {
    console.warn('[liveBallotService] Voter info cache lookup failed:', error);
    return null;
  }
}

async function cacheVoterInfo(stateCode: string, rules: VoteAmericaStateRules): Promise<void> {
  try {
    await prisma.voterInfoCache.upsert({
      where: { stateCode: stateCode.toUpperCase() },
      update: {
        rules: JSON.parse(JSON.stringify(rules)) as Prisma.InputJsonValue,
        fetchedAt: new Date(),
      },
      create: {
        stateCode: stateCode.toUpperCase(),
        rules: JSON.parse(JSON.stringify(rules)) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.warn('[liveBallotService] Voter info cache write failed:', error);
  }
}

async function fetchVoterInfo(stateCode: string): Promise<{
  registrationUrl?: string;
  absenteeBallotUrl?: string;
  pollingPlaceUrl?: string;
  stateRules?: VoteAmericaStateRules;
} | null> {
  // 1. Check DB cache first
  const cached = await getCachedVoterInfo(stateCode);
  if (cached) {
    console.log(`[liveBallotService] Voter info cache hit for ${stateCode}`);
    return cached;
  }

  // 2. Cache miss — get from curated data and persist to DB
  try {
    const rules = getVotingRules(stateCode);
    await cacheVoterInfo(stateCode, rules);
    console.log(`[liveBallotService] Voter info cached for ${stateCode}`);
    return {
      registrationUrl: rules.voter_registration_url,
      absenteeBallotUrl: rules.absentee_ballot_url,
      pollingPlaceUrl: rules.polling_place_url,
      stateRules: rules,
    };
  } catch (error) {
    console.warn('[liveBallotService] Voter info fetch failed:', error);
    return null;
  }
}

// ============================================
// District Resolution
// ============================================

/**
 * Resolve a zipcode to district information using Google Civic divisionsByAddress API.
 * Replacement for the retired Representatives API (turned down April 2025).
 * The API accepts a zipcode as the "address" parameter.
 */
export async function resolveDistrict(zipcode: string): Promise<DistrictInfo> {
  const divisions = await getDivisionsByAddress(zipcode);

  const ocdDivisionIds = Object.keys(divisions.divisions);

  let state = '';
  let county = '';
  let city = '';

  for (const divId of ocdDivisionIds) {
    const stateMatch = divId.match(/\/state:(\w+)/);
    if (stateMatch && !state) state = stateMatch[1].toUpperCase();

    const countyMatch = divId.match(/\/county:([^/]+)/);
    if (countyMatch && !county) county = decodeURIComponent(countyMatch[1]).replace(/_/g, ' ');

    const placeMatch = divId.match(/\/place:([^/]+)/);
    if (placeMatch && !city) city = decodeURIComponent(placeMatch[1]).replace(/_/g, ' ');
  }

  if (divisions.normalizedInput) {
    if (!state && divisions.normalizedInput.state) state = divisions.normalizedInput.state;
    if (!city && divisions.normalizedInput.city) city = divisions.normalizedInput.city;
  }

  return { state, county, city, ocdDivisionIds };
}

// ============================================
// Election Date Helper
// ============================================

function getNextElectionDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const nov = new Date(year, 10, 1);
  const dayOfWeek = nov.getDay();
  const firstMonday = dayOfWeek <= 1 ? 2 - dayOfWeek : 9 - dayOfWeek;
  const electionDay = new Date(year, 10, firstMonday + 1);

  if (now > electionDay) {
    const nextNov = new Date(year + 1, 10, 1);
    const nextDow = nextNov.getDay();
    const nextFirstMonday = nextDow <= 1 ? 2 - nextDow : 9 - nextDow;
    return new Date(year + 1, 10, nextFirstMonday + 1).toISOString().split('T')[0];
  }

  return electionDay.toISOString().split('T')[0];
}

// ============================================
// Main Pipeline
// ============================================

/**
 * Main pipeline: zipcode → live ballot data.
 *
 * Cache hierarchy (each layer checked before hitting the API):
 *   1. ZipcodeLookup DB  → district info + lat/lng
 *   2. BallotCache DB    → transformed ballot
 *   3. VoterInfoCache DB → state voting rules
 *
 * Falls back to static data on any failure.
 */
export async function lookupBallotByZipcode(zipcode: string): Promise<BallotLookupResult> {
  const normalized = normalizeZipcode(zipcode);

  // ── Fast path: check if we have everything cached in DB ──
  // This path works even without API keys.
  try {
    const cachedZip = await getCachedZipcode(normalized);
    if (cachedZip) {
      const electionDate = getNextElectionDate();
      const cachedBallot = await getCachedBallot(cachedZip.districtHash, electionDate);
      if (cachedBallot) {
        console.log('[liveBallotService] Full cache hit (zipcode + ballot)');
        const voterInfo = cachedZip.state
          ? await fetchVoterInfo(cachedZip.state)
          : null;
        return {
          ballot: cachedBallot.ballot,
          source: 'cache',
          fetchedAt: cachedBallot.fetchedAt.toISOString(),
          voterInfo,
        };
      }
    }
  } catch (error) {
    console.warn('[liveBallotService] Fast cache path failed:', error);
  }

  // ── Slow path: call external APIs ──
  if (!isLiveBallotEnabled()) {
    console.log('[liveBallotService] Live ballot not enabled, returning static data');
    return {
      ballot: getDefaultBallotData(),
      source: 'static_fallback',
      voterInfo: null,
    };
  }

  try {
    // Step 1: Resolve zipcode → district info
    const districtInfo = await resolveDistrict(normalized);
    const electionDate = getNextElectionDate();
    const districtHash = computeDistrictHash(districtInfo);

    // Step 2: Geocode the zipcode for Ballotpedia lat/lng
    const { lat, lng } = await geocodeAddress(normalized);
    districtInfo.lat = lat;
    districtInfo.lng = lng;

    // Cache the zipcode lookup for next time
    await cacheZipcode(normalized, districtInfo, districtHash);

    // Step 3: Check ballot cache
    const cachedBallot = await getCachedBallot(districtHash, electionDate);
    if (cachedBallot) {
      console.log('[liveBallotService] Ballot cache hit (after zipcode resolution)');
      const voterInfo = districtInfo.state
        ? await fetchVoterInfo(districtInfo.state)
        : null;
      return {
        ballot: cachedBallot.ballot,
        source: 'cache',
        fetchedAt: cachedBallot.fetchedAt.toISOString(),
        voterInfo,
      };
    }

    // Step 4: Fetch ballot from Ballotpedia
    const ballotpediaResponse = await getBallotByPoint(lat, lng, electionDate);

    let ballot: Ballot;
    if (
      ballotpediaResponse.success &&
      ballotpediaResponse.data.elections.length > 0
    ) {
      ballot = transformBallotpediaElection(
        ballotpediaResponse.data.elections[0],
        districtInfo,
      );
    } else {
      console.log('[liveBallotService] No elections found from Ballotpedia, using static data');
      return {
        ballot: getDefaultBallotData(),
        source: 'static_fallback',
        voterInfo: districtInfo.state
          ? await fetchVoterInfo(districtInfo.state)
          : null,
      };
    }

    // Step 5: Cache ballot
    await cacheBallot(districtHash, electionDate, ballot);

    // Step 6: Fetch voter info (also cached)
    const voterInfo = districtInfo.state
      ? await fetchVoterInfo(districtInfo.state)
      : null;

    return {
      ballot,
      source: 'live',
      fetchedAt: new Date().toISOString(),
      voterInfo,
    };
  } catch (error) {
    console.error('[liveBallotService] Pipeline failed, returning static data:', error);
    return {
      ballot: getDefaultBallotData(),
      source: 'static_fallback',
      voterInfo: null,
    };
  }
}
