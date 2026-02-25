import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '../../../__tests__/helpers/request';

// Mock liveBallotService
const mockLookup = vi.fn();
vi.mock('@/server/services/liveBallotService', () => ({
  lookupBallotByZipcode: (...args: unknown[]) => mockLookup(...args),
  isValidZipcode: (z: string) => /^\d{5}$/.test(z.replace(/\D/g, '').slice(0, 5)),
}));

import { GET } from '../ballot/by-zipcode/route';

describe('GET /api/ballot/by-zipcode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when zipcode is missing', async () => {
    const request = createMockRequest('GET', '/api/ballot/by-zipcode');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('zipcode');
  });

  it('returns 400 when zipcode is invalid', async () => {
    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=abc');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when zipcode is too short', async () => {
    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=123');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 200 with static fallback when no API keys', async () => {
    const staticBallot = {
      ballot: {
        id: 'static-1',
        electionDate: '2026-11-03',
        state: 'GA',
        county: 'Fulton',
        items: [],
      },
      source: 'static_fallback',
      voterInfo: null,
    };
    mockLookup.mockResolvedValueOnce(staticBallot);

    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=48226');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.source).toBe('static_fallback');
    expect(data.ballot.id).toBe('static-1');
  });

  it('returns 200 with live data', async () => {
    const liveBallot = {
      ballot: {
        id: 'mi-wayne-detroit-2026-general',
        electionDate: '2026-11-03',
        state: 'MI',
        county: 'Wayne',
        items: [
          { id: 'mi-contest-governor', type: 'candidate', office: 'Governor' },
        ],
      },
      source: 'live',
      fetchedAt: '2026-02-19T12:00:00.000Z',
      voterInfo: {
        registrationUrl: 'https://mvic.sos.state.mi.us/RegisterVoter',
        stateRules: {
          state_code: 'MI',
          state_name: 'Michigan',
          registration_deadline_online: '2026-10-19',
        },
      },
    };
    mockLookup.mockResolvedValueOnce(liveBallot);

    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=48226');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.source).toBe('live');
    expect(data.ballot.id).toBe('mi-wayne-detroit-2026-general');
    expect(data.voterInfo.registrationUrl).toBe('https://mvic.sos.state.mi.us/RegisterVoter');
  });

  it('passes trimmed zipcode to lookup service', async () => {
    mockLookup.mockResolvedValueOnce({
      ballot: { id: 'test', items: [] },
      source: 'static_fallback',
      voterInfo: null,
    });

    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=+48226+');
    await GET(request);

    expect(mockLookup).toHaveBeenCalledWith('48226');
  });

  it('returns 500 on unexpected error', async () => {
    mockLookup.mockRejectedValueOnce(new Error('Unexpected'));

    const request = createMockRequest('GET', '/api/ballot/by-zipcode?zipcode=48226');
    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
