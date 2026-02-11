import { describe, it, expect } from 'vitest';
import { GET as getCandidates } from '../candidates/route';
import { GET as getCandidateById } from '../candidates/[candidateId]/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('GET /api/candidates', () => {
  it('returns 200 with candidates array', async () => {
    const request = createMockRequest('GET', '/api/candidates');
    const response = await getCandidates(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each candidate has id and name', async () => {
    const request = createMockRequest('GET', '/api/candidates');
    const response = await getCandidates(request);
    const data = await response.json();

    for (const candidate of data) {
      expect(candidate.id).toBeTruthy();
      expect(candidate.name).toBeTruthy();
    }
  });
});

describe('GET /api/candidates/[candidateId]', () => {
  it('returns 200 for existing candidate', async () => {
    // Get list first to find an ID
    const listReq = createMockRequest('GET', '/api/candidates');
    const listRes = await getCandidates(listReq);
    const candidates = await listRes.json();

    if (candidates.length === 0) return;

    const request = createMockRequest('GET', `/api/candidates/${candidates[0].id}`);
    const response = await getCandidateById(request, {
      params: Promise.resolve({ candidateId: candidates[0].id }),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(candidates[0].id);
  });

  it('returns 404 for nonexistent candidate', async () => {
    const request = createMockRequest('GET', '/api/candidates/nonexistent');
    const response = await getCandidateById(request, {
      params: Promise.resolve({ candidateId: 'nonexistent' }),
    });
    expect(response.status).toBe(404);
  });
});
