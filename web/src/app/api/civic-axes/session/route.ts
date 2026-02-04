import { NextResponse, NextRequest } from 'next/server';
import * as civicAxesService from '@/server/services/civicAxesService';
import { NotFoundError } from '@/server/utils/errors';
import type { GovernmentLevel } from '@/server/types';

export async function GET(request: NextRequest) {
  try {
    const countParam = request.nextUrl.searchParams.get('count');
    const level = request.nextUrl.searchParams.get('level') as GovernmentLevel | null;
    const excludeIdsParam = request.nextUrl.searchParams.get('excludeIds');

    const count = countParam ? parseInt(countParam, 10) : undefined;
    const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : undefined;

    const result = civicAxesService.getItemsForSession({
      count,
      level: level || undefined,
      excludeIds,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
