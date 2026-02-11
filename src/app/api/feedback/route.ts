import { NextRequest, NextResponse } from 'next/server';
import * as feedbackService from '@/server/services/feedbackService';
import { AppError } from '@/server/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screen, screenName, type, message } = body;

    const entry = await feedbackService.createFeedback({
      screen,
      screenName,
      type: type ?? null,
      message,
    });

    return NextResponse.json({ success: true, id: entry.id });
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

export async function GET() {
  try {
    const entries = await feedbackService.listFeedback();
    return NextResponse.json({ entries });
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
