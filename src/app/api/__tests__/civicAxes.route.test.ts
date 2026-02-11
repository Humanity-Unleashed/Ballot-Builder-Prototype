import { describe, it, expect } from 'vitest';
import { GET as getSpec } from '../civic-axes/spec/route';
import { GET as getDomains } from '../civic-axes/domains/route';
import { GET as getItems } from '../civic-axes/items/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('GET /api/civic-axes/spec', () => {
  it('returns 200 with full spec', async () => {
    const request = createMockRequest('GET', '/api/civic-axes/spec');
    const response = await getSpec(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.domains)).toBe(true);
    expect(Array.isArray(data.axes)).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.domains.length).toBeGreaterThan(0);
  });
});

describe('GET /api/civic-axes/domains', () => {
  it('returns 200 with domains array', async () => {
    const request = createMockRequest('GET', '/api/civic-axes/domains');
    const response = await getDomains(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each domain has id and name', async () => {
    const request = createMockRequest('GET', '/api/civic-axes/domains');
    const response = await getDomains(request);
    const data = await response.json();

    for (const domain of data) {
      expect(domain.id).toBeTruthy();
      expect(domain.name).toBeTruthy();
    }
  });
});

describe('GET /api/civic-axes/items', () => {
  it('returns 200 with items array', async () => {
    const request = createMockRequest('GET', '/api/civic-axes/items');
    const response = await getItems(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
