import { vi } from 'vitest';

export const mockPrisma = {
  analyticsEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  feedbackEntry: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  ballotCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  voterInfoCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  zipcodeLookup: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
