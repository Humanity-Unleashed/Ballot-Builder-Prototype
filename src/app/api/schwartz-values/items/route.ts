import { NextRequest, NextResponse } from 'next/server';
import { getVignettes } from '@/server/services/schwartzService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const randomize = searchParams.get('randomize') !== 'false';

    const vignettes = getVignettes(randomize);
    return NextResponse.json({ vignettes });
  } catch (error) {
    console.error('Failed to get vignettes:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment vignettes' },
      { status: 500 }
    );
  }
}
