import { NextResponse, NextRequest } from 'next/server';
import * as blueprintService from '@/server/services/blueprintService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const excludeIdsParam = request.nextUrl.searchParams.get('excludeIds');
    const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : undefined;
    const result = await blueprintService.getStatements({ excludeIds });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
