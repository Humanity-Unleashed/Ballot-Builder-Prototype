import { NextResponse, NextRequest } from 'next/server';
import * as blueprintService from '@/server/services/blueprintService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(_request: NextRequest) {
  try {
    const result = await blueprintService.getStartStatement();
    if (!result) {
      return NextResponse.json({ error: 'No start statement found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
