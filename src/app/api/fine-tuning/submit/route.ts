import { NextResponse, NextRequest } from 'next/server';
import * as fineTuningService from '@/server/services/fineTuningService';
import { NotFoundError } from '@/server/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existingSessionId = request.headers.get('x-fine-tuning-session');
    const { response, sessionId } = fineTuningService.submitFineTuning(body, existingSessionId);

    return NextResponse.json(response, {
      headers: { 'X-Fine-Tuning-Session': sessionId },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
