import { NextRequest, NextResponse } from 'next/server';
import * as analyticsService from '@/server/services/analyticsService';
import { AppError } from '@/server/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, eventType, screen, screenName, properties, referrer, duration } = body;

    const event = await analyticsService.createEvent({
      sessionId,
      eventType,
      screen,
      screenName,
      properties,
      referrer: referrer ?? null,
      duration: duration ?? null,
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') ?? undefined;
    const eventType = searchParams.get('eventType') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const events = await analyticsService.listEvents({ sessionId, eventType, limit });
    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
