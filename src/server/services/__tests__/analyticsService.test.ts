import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma } from '../../../__tests__/mocks/prisma';
import { BadRequestError, InternalError } from '../../utils/errors';

// Must import after mock setup
import * as analyticsService from '../analyticsService';

// Mock the logger to avoid console noise
vi.mock('@/server/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('analyticsService.createEvent', () => {
  const validInput = {
    sessionId: 'sess-123',
    eventType: 'page_view',
    screen: '/home',
    screenName: 'Home',
  };

  it('creates event with valid input', async () => {
    const mockEvent = {
      id: 'evt-1',
      sessionId: 'sess-123',
      eventType: 'page_view',
      screen: '/home',
      screenName: 'Home',
      properties: {},
      referrer: null,
      duration: null,
      createdAt: new Date(),
    };
    mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);

    const result = await analyticsService.createEvent(validInput);
    expect(result.id).toBe('evt-1');
    expect(result.sessionId).toBe('sess-123');
    expect(result.eventType).toBe('page_view');
    expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledOnce();
  });

  it('throws BadRequestError for missing sessionId', async () => {
    await expect(
      analyticsService.createEvent({ ...validInput, sessionId: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws BadRequestError for missing eventType', async () => {
    await expect(
      analyticsService.createEvent({ ...validInput, eventType: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws BadRequestError for missing screen', async () => {
    await expect(
      analyticsService.createEvent({ ...validInput, screen: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws BadRequestError for missing screenName', async () => {
    await expect(
      analyticsService.createEvent({ ...validInput, screenName: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('wraps Prisma errors as InternalError', async () => {
    mockPrisma.analyticsEvent.create.mockRejectedValue(new Error('DB connection failed'));

    await expect(analyticsService.createEvent(validInput)).rejects.toThrow(InternalError);
  });

  it('passes optional properties, referrer, duration', async () => {
    const mockEvent = {
      id: 'evt-2',
      sessionId: 'sess-123',
      eventType: 'click',
      screen: '/home',
      screenName: 'Home',
      properties: { button: 'cta' },
      referrer: '/landing',
      duration: 5000,
      createdAt: new Date(),
    };
    mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);

    const result = await analyticsService.createEvent({
      ...validInput,
      eventType: 'click',
      properties: { button: 'cta' },
      referrer: '/landing',
      duration: 5000,
    });
    expect(result.referrer).toBe('/landing');
    expect(result.duration).toBe(5000);
  });
});

describe('analyticsService.listEvents', () => {
  it('returns events array', async () => {
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

    const result = await analyticsService.listEvents();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('evt-1');
  });

  it('passes filters to Prisma', async () => {
    mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

    await analyticsService.listEvents({ sessionId: 'sess-1', eventType: 'click', limit: 50 });
    expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId: 'sess-1', eventType: 'click' },
        take: 50,
      })
    );
  });

  it('returns empty array when no events', async () => {
    mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);
    const result = await analyticsService.listEvents();
    expect(result).toEqual([]);
  });

  it('wraps Prisma errors as InternalError', async () => {
    mockPrisma.analyticsEvent.findMany.mockRejectedValue(new Error('DB error'));
    await expect(analyticsService.listEvents()).rejects.toThrow(InternalError);
  });
});
