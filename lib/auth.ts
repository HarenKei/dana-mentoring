import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { type SessionData, sessionOptions } from './session';

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect('/login');
  }
  return session;
}
