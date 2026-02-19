import { NextResponse, NextRequest } from 'next/server';
import { lookupBallotByZipcode, isValidZipcode } from '@/server/services/liveBallotService';

export async function GET(request: NextRequest) {
  try {
    const zipcode = request.nextUrl.searchParams.get('zipcode');

    if (!zipcode || !isValidZipcode(zipcode)) {
      return NextResponse.json(
        { error: 'A valid 5-digit US zipcode is required (e.g., ?zipcode=48226)' },
        { status: 400 },
      );
    }

    const result = await lookupBallotByZipcode(zipcode.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ballot/by-zipcode] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
