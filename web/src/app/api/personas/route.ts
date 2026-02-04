import { NextResponse, NextRequest } from 'next/server';
import { personas } from '@/server/data';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(personas);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
