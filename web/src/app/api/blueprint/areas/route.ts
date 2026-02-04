import { NextResponse, NextRequest } from 'next/server';
import { ISSUE_AREAS } from '@/server/services/blueprintService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(ISSUE_AREAS);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
