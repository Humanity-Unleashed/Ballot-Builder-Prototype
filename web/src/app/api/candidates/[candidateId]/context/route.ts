import { NextResponse, NextRequest } from 'next/server';
import * as ballotService from '@/server/services/ballotService';
import { NotFoundError } from '@/server/utils/errors';
import type { PolicyTopicId } from '@/server/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const topicId = request.nextUrl.searchParams.get('topicId') as PolicyTopicId | null;
    const result = ballotService.listCandidateContext(
      candidateId,
      topicId || undefined
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
