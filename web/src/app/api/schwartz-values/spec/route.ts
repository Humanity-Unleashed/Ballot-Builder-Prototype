import { NextResponse } from 'next/server';
import { getSpec } from '@/server/services/schwartzService';

export async function GET() {
  try {
    const spec = getSpec();
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Failed to get Schwartz spec:', error);
    return NextResponse.json(
      { error: 'Failed to load Schwartz values specification' },
      { status: 500 }
    );
  }
}
