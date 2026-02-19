import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockBallotCache, mockVoterInfoCache, mockZipcodeLookup } = vi.hoisted(() => ({
  mockBallotCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  mockVoterInfoCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  mockZipcodeLookup: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    ballotCache: mockBallotCache,
    voterInfoCache: mockVoterInfoCache,
    zipcodeLookup: mockZipcodeLookup,
  },
}));

vi.mock('../externalApis');
vi.mock('../ballotService', () => ({
  getDefaultBallotData: vi.fn(() => ({
    id: 'static-ballot-1',
    electionDate: '2026-11-03',
    state: 'GA',
    county: 'Fulton',
    items: [],
  })),
}));

import {
  isLiveBallotEnabled,
  normalizeZipcode,
  isValidZipcode,
  resolveDistrict,
  lookupBallotByZipcode,
} from '../liveBallotService';
import {
  getRepresentatives,
  geocodeAddress,
  getBallotByPoint,
  getVotingRules,
} from '../externalApis';

const mockedGetReps = vi.mocked(getRepresentatives);
const mockedGeocode = vi.mocked(geocodeAddress);
const mockedGetBallot = vi.mocked(getBallotByPoint);
const mockedGetRules = vi.mocked(getVotingRules);

describe('liveBallotService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Default: all DB caches miss
    mockZipcodeLookup.findUnique.mockResolvedValue(null);
    mockBallotCache.findUnique.mockResolvedValue(null);
    mockVoterInfoCache.findUnique.mockResolvedValue(null);
    mockZipcodeLookup.upsert.mockResolvedValue({});
    mockBallotCache.upsert.mockResolvedValue({});
    mockVoterInfoCache.upsert.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isLiveBallotEnabled', () => {
    it('returns true when both API keys are set', () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';
      expect(isLiveBallotEnabled()).toBe(true);
    });

    it('returns false when GOOGLE_CIVIC_API_KEY is missing', () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;
      process.env.BALLOTPEDIA_API_KEY = 'key2';
      expect(isLiveBallotEnabled()).toBe(false);
    });

    it('returns false when BALLOTPEDIA_API_KEY is missing', () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      delete process.env.BALLOTPEDIA_API_KEY;
      expect(isLiveBallotEnabled()).toBe(false);
    });
  });

  describe('normalizeZipcode', () => {
    it('strips non-digits and keeps first 5', () => {
      expect(normalizeZipcode('48226')).toBe('48226');
      expect(normalizeZipcode('48226-1234')).toBe('48226');
      expect(normalizeZipcode(' 48226 ')).toBe('48226');
    });
  });

  describe('isValidZipcode', () => {
    it('accepts 5-digit zipcodes', () => {
      expect(isValidZipcode('48226')).toBe(true);
      expect(isValidZipcode('90210')).toBe(true);
    });

    it('accepts zip+4 format (normalizes to 5)', () => {
      expect(isValidZipcode('48226-1234')).toBe(true);
    });

    it('rejects invalid zipcodes', () => {
      expect(isValidZipcode('1234')).toBe(false);
      expect(isValidZipcode('abcde')).toBe(false);
      expect(isValidZipcode('')).toBe(false);
    });
  });

  describe('resolveDistrict', () => {
    it('extracts state, county, city from OCD division IDs', async () => {
      mockedGetReps.mockResolvedValueOnce({
        kind: 'civicinfo#representativeInfoResponse',
        divisions: {
          'ocd-division/country:us': { name: 'United States' },
          'ocd-division/country:us/state:mi': { name: 'Michigan' },
          'ocd-division/country:us/state:mi/county:wayne': { name: 'Wayne County' },
          'ocd-division/country:us/state:mi/place:detroit': { name: 'Detroit' },
        },
        offices: [],
        officials: [],
      });

      const result = await resolveDistrict('48226');
      expect(result.state).toBe('MI');
      expect(result.county).toBe('wayne');
      expect(result.city).toBe('detroit');
      expect(result.ocdDivisionIds).toHaveLength(4);
    });
  });

  describe('lookupBallotByZipcode', () => {
    it('returns static fallback when API keys are not set and no DB cache', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;
      delete process.env.BALLOTPEDIA_API_KEY;

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('static_fallback');
      expect(result.ballot.id).toBe('static-ballot-1');
      expect(result.voterInfo).toBeNull();
    });

    // ── Full DB cache hit (fast path — no API keys needed) ──
    it('returns from DB cache when zipcode + ballot are cached (no API keys needed)', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;
      delete process.env.BALLOTPEDIA_API_KEY;

      mockZipcodeLookup.findUnique.mockResolvedValueOnce({
        zipcode: '48226',
        state: 'MI',
        county: 'wayne',
        city: 'detroit',
        ocdDivisionIds: ['ocd-division/country:us/state:mi'],
        lat: 42.33,
        lng: -83.04,
        districtHash: 'abcdef1234567890',
        fetchedAt: new Date(),
      });

      mockBallotCache.findUnique.mockResolvedValueOnce({
        districtHash: 'abcdef1234567890',
        electionDate: '2026-11-03',
        rawBallot: {
          id: 'mi-cached-ballot',
          electionDate: '2026-11-03',
          state: 'MI',
          county: 'Wayne',
          items: [{ id: 'contest-1', type: 'candidate', office: 'Governor' }],
        },
        fetchedAt: new Date(),
      });

      mockVoterInfoCache.findUnique.mockResolvedValueOnce({
        stateCode: 'MI',
        rules: {
          state_code: 'MI',
          state_name: 'Michigan',
          voter_registration_url: 'https://mvic.sos.state.mi.us/RegisterVoter',
          registration_deadline_online: '2026-10-19',
        },
        fetchedAt: new Date(),
      });

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('cache');
      expect(result.ballot.id).toBe('mi-cached-ballot');
      expect(result.voterInfo?.registrationUrl).toBe('https://mvic.sos.state.mi.us/RegisterVoter');
      expect(result.voterInfo?.stateRules?.registration_deadline_online).toBe('2026-10-19');

      // No external APIs should have been called
      expect(mockedGetReps).not.toHaveBeenCalled();
      expect(mockedGeocode).not.toHaveBeenCalled();
      expect(mockedGetBallot).not.toHaveBeenCalled();
      expect(mockedGetRules).not.toHaveBeenCalled();
    });

    it('uses cached voter info when only ballot needs fetching', async () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';

      mockedGetReps.mockResolvedValueOnce({
        kind: 'civicinfo#representativeInfoResponse',
        divisions: { 'ocd-division/country:us/state:mi': { name: 'Michigan' } },
        offices: [],
        officials: [],
      });
      mockedGeocode.mockResolvedValueOnce({ lat: 42.33, lng: -83.04 });

      mockedGetBallot.mockResolvedValueOnce({
        success: true,
        data: {
          elections: [{
            id: 500,
            date: '2026-11-03',
            type: 'General Election',
            races: [{ id: 600, office: 'Governor', office_level: 'State', candidates: [] }],
            measures: [],
          }],
        },
      });

      mockVoterInfoCache.findUnique.mockResolvedValueOnce({
        stateCode: 'MI',
        rules: {
          state_code: 'MI',
          state_name: 'Michigan',
          voter_registration_url: 'https://vote.mi.gov',
        },
        fetchedAt: new Date(),
      });

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('live');
      expect(result.voterInfo?.registrationUrl).toBe('https://vote.mi.gov');
      expect(mockedGetRules).not.toHaveBeenCalled();
    });

    it('fetches live ballot on full cache miss and caches everything', async () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';

      mockedGetReps.mockResolvedValueOnce({
        kind: 'civicinfo#representativeInfoResponse',
        divisions: { 'ocd-division/country:us/state:mi': { name: 'Michigan' } },
        offices: [],
        officials: [],
      });
      mockedGeocode.mockResolvedValueOnce({ lat: 42.33, lng: -83.04 });

      mockedGetBallot.mockResolvedValueOnce({
        success: true,
        data: {
          elections: [{
            id: 500,
            date: '2026-11-03',
            type: 'General Election',
            races: [{
              id: 600,
              office: 'Governor',
              office_level: 'State',
              candidates: [{ id: 1, name: 'Test Candidate', party: 'Democratic' }],
            }],
            measures: [],
          }],
        },
      });

      mockedGetRules.mockReturnValueOnce({
        state_code: 'MI',
        state_name: 'Michigan',
        voter_registration_url: 'https://vote.mi.gov',
      } as never);

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('live');
      expect(result.ballot.id).toBe('bp-ballot-500');
      expect(result.voterInfo?.registrationUrl).toBe('https://vote.mi.gov');

      // All three caches should have been written
      expect(mockZipcodeLookup.upsert).toHaveBeenCalled();
      expect(mockBallotCache.upsert).toHaveBeenCalled();
      expect(mockVoterInfoCache.upsert).toHaveBeenCalled();
    });

    it('falls back to static on pipeline error', async () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';

      mockedGetReps.mockRejectedValueOnce(new Error('Network error'));

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('static_fallback');
      expect(result.ballot.id).toBe('static-ballot-1');
    });

    it('returns static fallback when no elections found', async () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';

      mockedGetReps.mockResolvedValueOnce({
        kind: 'civicinfo#representativeInfoResponse',
        divisions: { 'ocd-division/country:us/state:mi': { name: 'Michigan' } },
        offices: [],
        officials: [],
      });
      mockedGeocode.mockResolvedValueOnce({ lat: 42.33, lng: -83.04 });

      mockedGetBallot.mockResolvedValueOnce({
        success: true,
        data: { elections: [] },
      });

      mockedGetRules.mockReturnValueOnce({
        state_code: 'MI',
        state_name: 'Michigan',
      } as never);

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('static_fallback');
    });

    it('skips stale zipcode cache and re-resolves via API', async () => {
      process.env.GOOGLE_CIVIC_API_KEY = 'key1';
      process.env.BALLOTPEDIA_API_KEY = 'key2';

      // Stale cache (31 days old)
      const staleDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      mockZipcodeLookup.findUnique.mockResolvedValueOnce({
        zipcode: '48226',
        state: 'MI',
        ocdDivisionIds: ['ocd-division/country:us/state:mi'],
        districtHash: 'old-hash',
        fetchedAt: staleDate,
      });

      mockedGetReps.mockResolvedValueOnce({
        kind: 'civicinfo#representativeInfoResponse',
        divisions: { 'ocd-division/country:us/state:mi': { name: 'Michigan' } },
        offices: [],
        officials: [],
      });
      mockedGeocode.mockResolvedValueOnce({ lat: 42.33, lng: -83.04 });

      mockedGetBallot.mockResolvedValueOnce({
        success: true,
        data: {
          elections: [{
            id: 700,
            date: '2026-11-03',
            type: 'General',
            races: [],
            measures: [],
          }],
        },
      });

      mockedGetRules.mockReturnValueOnce({
        state_code: 'MI',
        state_name: 'Michigan',
      } as never);

      const result = await lookupBallotByZipcode('48226');
      expect(result.source).toBe('live');
      expect(mockedGetReps).toHaveBeenCalled();
    });
  });
});
