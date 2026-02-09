import { NextResponse, NextRequest } from 'next/server';
import { getPersonaPreferences } from '@/server/data';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = getPersonaPreferences(id);
    if (!result) {
      return NextResponse.json({ error: 'Persona preferences not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
