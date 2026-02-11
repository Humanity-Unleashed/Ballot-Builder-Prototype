import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma } from '../../../__tests__/mocks/prisma';
import { createMockRequest } from '../../../__tests__/helpers/request';

vi.mock('@/server/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// Import routes after mocks
import { POST, GET } from '../analytics/route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/analytics', () => {
  it('returns 200 with success for valid input', async () => {
    mockPrisma.analyticsEvent.create.mockResolvedValue({
      id: 'evt-1',
      sessionId: 'sess-1',
      eventType: 'page_view',
      screen: '/home',
      screenName: 'Home',
      properties: {},
      referrer: null,
      duration: null,
      createdAt: new Date(),
    });

    const request = createMockRequest('POST', '/api/analytics', {
      sessionId: 'sess-1',
      eventType: 'page_view',
      screen: '/home',
      screenName: 'Home',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.id).toBe('evt-1');
  });

  it('returns 400 for missing required fields', async () => {
    const request = createMockRequest('POST', '/api/analytics', {
      sessionId: 'sess-1',
      // missing eventType, screen, screenName
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/analytics', () => {
  it('returns 200 with events', async () => {
    mockPrisma.analyticsEvent.findMany.mockResolvedValue([
      {
        id: 'evt-1',
        sessionId: 'sess-1',
        eventType: 'page_view',
        screen: '/home',
        screenName: 'Home',
        properties: {},
        referrer: null,
        duration: null,
        createdAt: new Date(),
      },
    ]);

    const request = createMockRequest('GET', '/api/analytics');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.events).toHaveLength(1);
  });

  it('passes filter params', async () => {
    mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

    const request = createMockRequest('GET', '/api/analytics?sessionId=sess-1&eventType=click');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
