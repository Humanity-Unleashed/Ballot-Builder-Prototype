import { NextResponse, NextRequest } from 'next/server';
import * as civicAxesService from '@/server/services/civicAxesService';
import { NotFoundError } from '@/server/utils/errors';
import type { GovernmentLevel } from '@/server/types';

export async function GET(request: NextRequest) {
  try {
    const level = request.nextUrl.searchParams.get('level') as GovernmentLevel | null;
    const tag = request.nextUrl.searchParams.get('tag');
    const axisId = request.nextUrl.searchParams.get('axisId');

    let result;

    if (axisId) {
      result = civicAxesService.getItemsForAxis(axisId);
    } else if (level) {
      result = civicAxesService.getItemsByLevel(level);
    } else if (tag) {
      result = civicAxesService.getItemsByTag(tag);
    } else {
      result = civicAxesService.getAllItems();
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
