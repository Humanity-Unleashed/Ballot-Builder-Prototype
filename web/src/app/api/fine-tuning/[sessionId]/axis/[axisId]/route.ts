import { NextResponse, NextRequest } from 'next/server';
import * as fineTuningService from '@/server/services/fineTuningService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; axisId: string }> }
) {
  try {
    const { sessionId, axisId } = await params;
    const session = fineTuningService.getFineTuningSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Fine-tuning session not found' }, { status: 404 });
    }
    const axisData = fineTuningService.getFineTuningAxisData(sessionId, axisId);
    if (!axisData) {
      return NextResponse.json({ error: 'No fine-tuning data for this axis' }, { status: 404 });
    }
    return NextResponse.json(axisData);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
