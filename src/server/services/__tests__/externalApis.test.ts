import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));
const mockedGet = vi.mocked(axios.get);

// Mock FVAP client — defaults to rejecting (so Tier 3 kicks in for non-curated states)
vi.mock('../fvapClient', () => ({
  fetchFvapDeadlines: vi.fn(() => Promise.reject(new Error('FVAP mocked out'))),
}));

// Import after mock
import {
  getVoterInfo,
  getDivisionsByAddress,
  getBallotByPoint,
  getVotingRules,
  geocodeAddress,
  getRepresentativesByZipcode,
} from '../externalApis';

describe('externalApis', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      GOOGLE_CIVIC_API_KEY: 'test-google-key',
      BALLOTPEDIA_API_KEY: 'test-bp-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getVoterInfo', () => {
    it('calls Google Civic voterinfo endpoint with correct params', async () => {
      const mockResponse = {
        data: {
          election: { id: '1', name: 'Test Election', electionDay: '2026-11-03' },
          pollingLocations: [],
        },
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await getVoterInfo('123 Main St, Detroit, MI');

      expect(mockedGet).toHaveBeenCalledWith(
        'https://www.googleapis.com/civicinfo/v2/voterinfo',
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'test-google-key',
            address: '123 Main St, Detroit, MI',
          }),
          timeout: 12000,
        }),
      );
      expect(result.election.name).toBe('Test Election');
    });

    it('throws when GOOGLE_CIVIC_API_KEY is not set', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;

      await expect(getVoterInfo('123 Main St')).rejects.toThrow(
        'GOOGLE_CIVIC_API_KEY is not configured',
      );
    });
  });

  describe('getDivisionsByAddress', () => {
    it('calls Google Civic divisionsByAddress endpoint', async () => {
      const mockResponse = {
        data: {
          kind: 'civicinfo#divisionsByAddressResponse',
          divisions: { 'ocd-division/country:us/state:mi': { name: 'Michigan' } },
        },
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await getDivisionsByAddress('48226');

      expect(mockedGet).toHaveBeenCalledWith(
        'https://www.googleapis.com/civicinfo/v2/divisionsByAddress',
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'test-google-key',
            address: '48226',
          }),
        }),
      );
      expect(result.divisions).toHaveProperty('ocd-division/country:us/state:mi');
    });

    it('throws when GOOGLE_CIVIC_API_KEY is not set', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;

      await expect(getDivisionsByAddress('48226')).rejects.toThrow(
        'GOOGLE_CIVIC_API_KEY is not configured',
      );
    });
  });

  describe('geocodeAddress', () => {
    it('returns lat/lng from Google Geocoding API', async () => {
      mockedGet.mockResolvedValueOnce({
        data: {
          results: [{ geometry: { location: { lat: 42.33, lng: -83.04 } } }],
          status: 'OK',
        },
      });

      const result = await geocodeAddress('123 Main St, Detroit, MI');
      expect(result).toEqual({ lat: 42.33, lng: -83.04 });
    });

    it('throws on non-OK status', async () => {
      mockedGet.mockResolvedValueOnce({
        data: { results: [], status: 'ZERO_RESULTS' },
      });

      await expect(geocodeAddress('invalid')).rejects.toThrow('Geocoding failed');
    });
  });

  describe('getBallotByPoint', () => {
    it('calls Ballotpedia elections_by_point endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { elections: [] },
        },
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await getBallotByPoint(42.33, -83.04, '2026-11-03');

      expect(mockedGet).toHaveBeenCalledWith(
        'https://api4.ballotpedia.org/data/elections_by_point',
        expect.objectContaining({
          params: { lat: 42.33, lng: -83.04, election_date: '2026-11-03' },
          headers: { 'x-api-key': 'test-bp-key' },
          timeout: 15000,
        }),
      );
      expect(result.success).toBe(true);
    });

    it('throws when BALLOTPEDIA_API_KEY is not set', async () => {
      delete process.env.BALLOTPEDIA_API_KEY;

      await expect(getBallotByPoint(42.33, -83.04, '2026-11-03')).rejects.toThrow(
        'BALLOTPEDIA_API_KEY is not configured',
      );
    });
  });

  describe('getRepresentativesByZipcode', () => {
    it('calls 5 Calls representatives endpoint with correct params', async () => {
      process.env['5_CALLS_API_KEY'] = 'test-5calls-key';

      const mockResponse = {
        data: {
          location: '48226',
          lowAccuracy: false,
          state: 'MI',
          district: '13',
          representatives: [
            { id: 'rep1', name: 'Test Rep', phone: '202-555-0001', party: 'Democratic', state: 'MI', reason: 'rep', area: 'US House' },
          ],
        },
      };
      mockedGet.mockResolvedValueOnce(mockResponse);

      const result = await getRepresentativesByZipcode('48226');

      expect(mockedGet).toHaveBeenCalledWith(
        'https://api.5calls.org/v1/representatives',
        expect.objectContaining({
          params: { location: '48226' },
          headers: { 'X-5Calls-Token': 'test-5calls-key' },
          timeout: 12000,
        }),
      );
      expect(result.representatives).toHaveLength(1);
      expect(result.representatives[0].name).toBe('Test Rep');
    });

    it('throws when 5_CALLS_API_KEY is not set', async () => {
      delete process.env['5_CALLS_API_KEY'];

      await expect(getRepresentativesByZipcode('48226')).rejects.toThrow(
        '5_CALLS_API_KEY is not configured',
      );
    });
  });

  describe('getVotingRules', () => {
    it('Tier 1: returns curated data for supported states', async () => {
      const result = await getVotingRules('MI');

      expect(result.state_code).toBe('MI');
      expect(result.state_name).toBe('Michigan');
      expect(result.voter_registration_url).toBe('https://mvic.sos.state.mi.us/RegisterVoter');
      expect(result.registration_deadline_online).toBe('2026-10-19');
      expect(result.early_voting_starts).toBe('2026-10-24');
      expect(result.election_day_registration).toBe(true);
    });

    it('Tier 1: works without API keys (no external API needed)', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;
      delete process.env.BALLOTPEDIA_API_KEY;

      const result = await getVotingRules('mi');
      expect(result.state_code).toBe('MI');
      expect(mockedGet).not.toHaveBeenCalled();
    });

    it('Tier 3: returns generic fallback for unknown state codes', async () => {
      const result = await getVotingRules('ZZ');
      expect(result.state_code).toBe('ZZ');
      expect(result.voter_registration_url).toContain('vote.gov');
    });

    it('never throws — always returns a result', async () => {
      const result = await getVotingRules('CA');
      expect(result.state_code).toBe('CA');
      expect(result.state_name).toBe('California');
      expect(result.voter_registration_url).toContain('vote.gov');
    });
  });
});
