import { NextResponse, NextRequest } from 'next/server';
import * as fineTuningService from '@/server/services/fineTuningService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = fineTuningService.getFineTuningSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Fine-tuning session not found' }, { status: 404 });
    }
    return NextResponse.json({
      sessionId: session.id,
      axes: session.axes,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const deleted = fineTuningService.deleteFineTuningSession(sessionId);
    if (!deleted) {
      return NextResponse.json({ error: 'Fine-tuning session not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Fine-tuning session deleted', sessionId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
