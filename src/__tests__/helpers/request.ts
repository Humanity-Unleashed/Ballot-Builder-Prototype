import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockRequest(
  method: string,
  url: string,
  body?: unknown
): NextRequest {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}
