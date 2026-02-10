import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screen, screenName, type, message } = body;

    if (!screen || typeof screen !== 'string') {
      return NextResponse.json(
        { error: 'screen is required' },
        { status: 400 },
      );
    }
    if (!screenName || typeof screenName !== 'string') {
      return NextResponse.json(
        { error: 'screenName is required' },
        { status: 400 },
      );
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 },
      );
    }
    if (type !== null && typeof type !== 'string') {
      return NextResponse.json(
        { error: 'type must be a string or null' },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();

    // TODO: Replace with kv.lpush() when Vercel KV is configured
    // await kv.lpush('feedback', { id, screen, screenName, type, message, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
}

export async function GET() {
  // TODO: Replace with kv.lrange('feedback', 0, -1) when Vercel KV is configured
  return NextResponse.json({ entries: [] });
}
