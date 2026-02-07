import { NextRequest, NextResponse } from 'next/server';
import { scoreResponses, type ItemResponse } from '@/server/services/schwartzService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const responses: ItemResponse[] = body.responses;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'responses array is required' },
        { status: 400 }
      );
    }

    // Validate responses
    for (const r of responses) {
      if (!r.item_id || typeof r.response !== 'number' || r.response < 1 || r.response > 5) {
        return NextResponse.json(
          { error: `Invalid response: ${JSON.stringify(r)}. response must be 1-5.` },
          { status: 400 }
        );
      }
    }

    const result = scoreResponses(responses);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to score responses:', error);
    return NextResponse.json(
      { error: 'Failed to score responses' },
      { status: 500 }
    );
  }
}
