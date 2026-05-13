import { NextRequest, NextResponse } from 'next/server';

/** Forwards OAuth query to the client callback (PKCE verifier lives in the browser). */
export function GET(request: NextRequest) {
  const u = new URL('/auth/callback', request.nextUrl.origin);
  request.nextUrl.searchParams.forEach((v, k) => u.searchParams.set(k, v));
  return NextResponse.redirect(u);
}
