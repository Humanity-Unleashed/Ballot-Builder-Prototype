import { NextResponse, NextRequest } from 'next/server';
import * as assessmentService from '@/server/services/assessmentService';
import { NotFoundError } from '@/server/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = assessmentService.startAssessment(body.selectedDomains, body.userId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
