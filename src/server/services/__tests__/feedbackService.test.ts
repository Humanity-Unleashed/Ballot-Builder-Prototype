import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma } from '../../../__tests__/mocks/prisma';
import { BadRequestError, InternalError } from '../../utils/errors';

import * as feedbackService from '../feedbackService';

vi.mock('@/server/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/lib/googleSheets', () => ({
  appendFeedbackRow: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('feedbackService.createFeedback', () => {
  const validInput = {
    screen: '/ballot',
    screenName: 'Ballot',
    type: 'bug',
    message: 'Something is wrong',
  };

  it('creates feedback with valid input', async () => {
    const mockEntry = {
      id: 'fb-1',
      screen: '/ballot',
      screenName: 'Ballot',
      type: 'bug',
      message: 'Something is wrong',
      createdAt: new Date(),
    };
    mockPrisma.feedbackEntry.create.mockResolvedValue(mockEntry);

    const result = await feedbackService.createFeedback(validInput);
    expect(result.id).toBe('fb-1');
    expect(result.screen).toBe('/ballot');
    expect(result.message).toBe('Something is wrong');
    expect(mockPrisma.feedbackEntry.create).toHaveBeenCalledOnce();
  });

  it('throws BadRequestError for missing screen', async () => {
    await expect(
      feedbackService.createFeedback({ ...validInput, screen: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws BadRequestError for missing screenName', async () => {
    await expect(
      feedbackService.createFeedback({ ...validInput, screenName: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws BadRequestError for missing message', async () => {
    await expect(
      feedbackService.createFeedback({ ...validInput, message: '' })
    ).rejects.toThrow(BadRequestError);
  });

  it('accepts null type', async () => {
    const mockEntry = {
      id: 'fb-2',
      screen: '/ballot',
      screenName: 'Ballot',
      type: null,
      message: 'Feedback',
      createdAt: new Date(),
    };
    mockPrisma.feedbackEntry.create.mockResolvedValue(mockEntry);

    const result = await feedbackService.createFeedback({
      ...validInput,
      type: null,
    });
    expect(result.type).toBeNull();
  });

  it('wraps Prisma errors as InternalError', async () => {
    mockPrisma.feedbackEntry.create.mockRejectedValue(new Error('DB error'));
    await expect(feedbackService.createFeedback(validInput)).rejects.toThrow(InternalError);
  });
});

describe('feedbackService.listFeedback', () => {
  it('returns feedback entries', async () => {
    mockPrisma.feedbackEntry.findMany.mockResolvedValue([
      {
        id: 'fb-1',
        screen: '/home',
        screenName: 'Home',
        type: 'suggestion',
        message: 'Great app',
        createdAt: new Date(),
      },
    ]);

    const result = await feedbackService.listFeedback();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fb-1');
  });

  it('returns empty array when no entries', async () => {
    mockPrisma.feedbackEntry.findMany.mockResolvedValue([]);
    const result = await feedbackService.listFeedback();
    expect(result).toEqual([]);
  });

  it('wraps Prisma errors as InternalError', async () => {
    mockPrisma.feedbackEntry.findMany.mockRejectedValue(new Error('DB error'));
    await expect(feedbackService.listFeedback()).rejects.toThrow(InternalError);
  });
});
