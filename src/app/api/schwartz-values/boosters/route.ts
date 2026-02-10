import { NextRequest, NextResponse } from 'next/server';
import { getBoosterSetsMeta, getBoosterSetById } from '@/server/data/schwartzValues';

/**
 * GET /api/schwartz-values/boosters
 * Returns booster set metadata. Pass ?id=<boosterId> to get full items for one set.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const booster = getBoosterSetById(id);
    if (!booster) {
      return NextResponse.json({ error: 'Booster set not found' }, { status: 404 });
    }
    return NextResponse.json(booster);
  }

  return NextResponse.json({ boosters: getBoosterSetsMeta() });
}
