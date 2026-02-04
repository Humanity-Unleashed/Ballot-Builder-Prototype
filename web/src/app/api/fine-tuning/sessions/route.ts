import { NextResponse, NextRequest } from 'next/server';
import * as fineTuningService from '@/server/services/fineTuningService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(_request: NextRequest) {
  try {
    const result = fineTuningService.listFineTuningSessions();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
