import { NextResponse, NextRequest } from 'next/server';
import * as ballotService from '@/server/services/ballotService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const contestId = request.nextUrl.searchParams.get('contestId') || undefined;
    const result = ballotService.listCandidates(contestId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
