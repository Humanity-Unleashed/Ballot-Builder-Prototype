import { NextResponse, NextRequest } from 'next/server';
import * as assessmentService from '@/server/services/assessmentService';
import { NotFoundError } from '@/server/utils/errors';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const result = assessmentService.completeAssessment(sessionId);
    if (!result) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
