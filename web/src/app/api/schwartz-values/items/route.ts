import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentItems } from '@/server/services/schwartzService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const randomize = searchParams.get('randomize') !== 'false';

    const items = getAssessmentItems(randomize);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to get assessment items:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment items' },
      { status: 500 }
    );
  }
}
