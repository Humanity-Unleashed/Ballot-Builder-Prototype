import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { BadRequestError, InternalError } from '@/server/utils/errors';
import logger from '@/server/utils/logger';

interface CreateEventInput {
  sessionId: string;
  eventType: string;
  screen: string;
  screenName: string;
  properties?: Record<string, unknown>;
  referrer?: string | null;
  duration?: number | null;
}

interface AnalyticsEventResponse {
  id: string;
  sessionId: string;
  eventType: string;
  screen: string;
  screenName: string;
  properties: unknown;
  referrer: string | null;
  duration: number | null;
  createdAt: string;
}

interface ListEventsFilters {
  sessionId?: string;
  eventType?: string;
  limit?: number;
}

export async function createEvent(input: CreateEventInput): Promise<AnalyticsEventResponse> {
  const { sessionId, eventType, screen, screenName, properties, referrer, duration } = input;

  if (!sessionId || typeof sessionId !== 'string') {
    throw new BadRequestError('sessionId is required');
  }
  if (!eventType || typeof eventType !== 'string') {
    throw new BadRequestError('eventType is required');
  }
  if (!screen || typeof screen !== 'string') {
    throw new BadRequestError('screen is required');
  }
  if (!screenName || typeof screenName !== 'string') {
    throw new BadRequestError('screenName is required');
  }

  try {
    const event = await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        screen,
        screenName,
        properties: (properties ?? {}) as Prisma.InputJsonValue,
        referrer: referrer ?? null,
        duration: duration ?? null,
      },
    });

    logger.info('Analytics event created', { id: event.id, eventType, screen });

    return {
      id: event.id,
      sessionId: event.sessionId,
      eventType: event.eventType,
      screen: event.screen,
      screenName: event.screenName,
      properties: event.properties,
      referrer: event.referrer,
      duration: event.duration,
      createdAt: event.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error('Failed to create analytics event', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new InternalError('Failed to save analytics event');
  }
}

export async function listEvents(filters?: ListEventsFilters): Promise<AnalyticsEventResponse[]> {
  const { sessionId, eventType, limit = 200 } = filters ?? {};

  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        ...(sessionId ? { sessionId } : {}),
        ...(eventType ? { eventType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return events.map((event) => ({
      id: event.id,
      sessionId: event.sessionId,
      eventType: event.eventType,
      screen: event.screen,
      screenName: event.screenName,
      properties: event.properties,
      referrer: event.referrer,
      duration: event.duration,
      createdAt: event.createdAt.toISOString(),
    }));
  } catch (error) {
    logger.error('Failed to list analytics events', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new InternalError('Failed to retrieve analytics events');
  }
}
