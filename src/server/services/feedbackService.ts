import { prisma } from '@/lib/prisma';
import { appendFeedbackRow } from '@/lib/googleSheets';
import { BadRequestError, InternalError } from '@/server/utils/errors';
import logger from '@/server/utils/logger';

interface CreateFeedbackInput {
  screen: string;
  screenName: string;
  type: string | null;
  message: string;
}

interface FeedbackEntryResponse {
  id: string;
  screen: string;
  screenName: string;
  type: string | null;
  message: string;
  createdAt: string;
}

export async function createFeedback(input: CreateFeedbackInput): Promise<FeedbackEntryResponse> {
  const { screen, screenName, type, message } = input;

  if (!screen || typeof screen !== 'string') {
    throw new BadRequestError('screen is required');
  }
  if (!screenName || typeof screenName !== 'string') {
    throw new BadRequestError('screenName is required');
  }
  if (!message || typeof message !== 'string') {
    throw new BadRequestError('message is required');
  }
  if (type !== null && type !== undefined && typeof type !== 'string') {
    throw new BadRequestError('type must be a string or null');
  }

  try {
    const entry = await prisma.feedbackEntry.create({
      data: {
        screen,
        screenName,
        type: type ?? null,
        message,
      },
    });

    logger.info('Feedback created', { id: entry.id, screen });

    const response = {
      id: entry.id,
      screen: entry.screen,
      screenName: entry.screenName,
      type: entry.type,
      message: entry.message,
      createdAt: entry.createdAt.toISOString(),
    };

    appendFeedbackRow(response).catch(() => {});

    return response;
  } catch (error) {
    logger.error('Failed to create feedback', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new InternalError('Failed to save feedback');
  }
}

export async function listFeedback(): Promise<FeedbackEntryResponse[]> {
  try {
    const entries = await prisma.feedbackEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      screen: entry.screen,
      screenName: entry.screenName,
      type: entry.type,
      message: entry.message,
      createdAt: entry.createdAt.toISOString(),
    }));
  } catch (error) {
    logger.error('Failed to list feedback', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new InternalError('Failed to retrieve feedback');
  }
}
