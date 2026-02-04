import { NextResponse, NextRequest } from 'next/server';
import * as civicAxesService from '@/server/services/civicAxesService';
import { NotFoundError } from '@/server/utils/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { domainId } = await params;
    const result = civicAxesService.getDomainWithAxes(domainId);
    if (!result) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
