import { describe, it, expect } from 'vitest';
import { GET } from '../personas/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('GET /api/personas', () => {
  it('returns 200 with personas list', async () => {
    const request = createMockRequest('GET', '/api/personas');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each persona has id and name', async () => {
    const request = createMockRequest('GET', '/api/personas');
    const response = await GET(request);
    const data = await response.json();

    for (const persona of data) {
      expect(persona.id).toBeTruthy();
      expect(persona.name).toBeTruthy();
    }
  });
});
