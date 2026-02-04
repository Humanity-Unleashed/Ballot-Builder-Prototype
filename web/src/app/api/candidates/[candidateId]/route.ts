import { NextResponse, NextRequest } from 'next/server';
import * as ballotService from '@/server/services/ballotService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const result = ballotService.findCandidateById(candidateId);
    if (!result) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
