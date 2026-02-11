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
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
