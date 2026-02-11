import { describe, it, expect } from 'vitest';
import { GET as getMeasures } from '../measures/route';
import { GET as getMeasureById } from '../measures/[measureId]/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('GET /api/measures', () => {
  it('returns 200 with measures array', async () => {
    const request = createMockRequest('GET', '/api/measures');
    const response = await getMeasures(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('GET /api/measures/[measureId]', () => {
  it('returns 200 for existing measure', async () => {
    const listReq = createMockRequest('GET', '/api/measures');
    const listRes = await getMeasures(listReq);
    const measures = await listRes.json();

    if (measures.length === 0) return;

    const request = createMockRequest('GET', `/api/measures/${measures[0].id}`);
    const response = await getMeasureById(request, {
      params: Promise.resolve({ measureId: measures[0].id }),
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(measures[0].id);
  });

  it('returns 404 for nonexistent measure', async () => {
    const request = createMockRequest('GET', '/api/measures/nonexistent');
    const response = await getMeasureById(request, {
      params: Promise.resolve({ measureId: 'nonexistent' }),
    });
    expect(response.status).toBe(404);
  });
});
