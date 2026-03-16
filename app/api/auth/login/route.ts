import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, sessionOptions } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.isAdmin = true;
  await session.save();

  return res;
}
