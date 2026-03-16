import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, sessionOptions } from '@/lib/session';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isAdmin) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
