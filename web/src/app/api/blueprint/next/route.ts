import { NextResponse, NextRequest } from 'next/server';
import * as blueprintService from '@/server/services/blueprintService';
import { NotFoundError } from '@/server/utils/errors';
import type { ResponseType } from '@/server/types';

export async function GET(request: NextRequest) {
  try {
    const currentStatementId = request.nextUrl.searchParams.get('currentStatementId');
    const response = request.nextUrl.searchParams.get('response') as ResponseType | null;
    const result = await blueprintService.getNextStatement(currentStatementId, response);
    if (!result) {
      return NextResponse.json({ error: 'No next statement found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
