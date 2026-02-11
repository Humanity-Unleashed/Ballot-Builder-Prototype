import { describe, it, expect } from 'vitest';
import { GET as getDefault } from '../ballot/route';
import { GET as getById } from '../ballot/[ballotId]/route';
import { GET as getSummary } from '../ballot/[ballotId]/summary/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('GET /api/ballot', () => {
  it('returns 200 with default ballot', async () => {
    const request = createMockRequest('GET', '/api/ballot');
    const response = await getDefault(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBeTruthy();
    expect(Array.isArray(data.items)).toBe(true);
  });
});

describe('GET /api/ballot/[ballotId]', () => {
  it('returns 200 for existing ballot', async () => {
    // First get default to find an ID
    const defaultReq = createMockRequest('GET', '/api/ballot');
    const defaultRes = await getDefault(defaultReq);
    const defaultData = await defaultRes.json();

    const request = createMockRequest('GET', `/api/ballot/${defaultData.id}`);
    const response = await getById(request, {
      params: Promise.resolve({ ballotId: defaultData.id }),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(defaultData.id);
  });

  it('returns 404 for nonexistent ballot', async () => {
    const request = createMockRequest('GET', '/api/ballot/nonexistent');
    const response = await getById(request, {
      params: Promise.resolve({ ballotId: 'nonexistent' }),
    });
    expect(response.status).toBe(404);
  });
});

describe('GET /api/ballot/[ballotId]/summary', () => {
  it('returns 200 with summary counts', async () => {
    const defaultReq = createMockRequest('GET', '/api/ballot');
    const defaultRes = await getDefault(defaultReq);
    const defaultData = await defaultRes.json();

    const request = createMockRequest('GET', `/api/ballot/${defaultData.id}/summary`);
    const response = await getSummary(request, {
      params: Promise.resolve({ ballotId: defaultData.id }),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.contestCount).toBe('number');
    expect(typeof data.measureCount).toBe('number');
    expect(typeof data.totalItems).toBe('number');
  });

  it('returns 404 for nonexistent ballot', async () => {
    const request = createMockRequest('GET', '/api/ballot/nonexistent/summary');
    const response = await getSummary(request, {
      params: Promise.resolve({ ballotId: 'nonexistent' }),
    });
    expect(response.status).toBe(404);
  });
});
