import { NextResponse, NextRequest } from 'next/server';
import * as civicAxesService from '@/server/services/civicAxesService';
import { NotFoundError } from '@/server/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scores = civicAxesService.scoreResponses(body.responses);
    const scoringConfig = civicAxesService.getScoringConfig();
    return NextResponse.json({ scores, scoringConfig });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
