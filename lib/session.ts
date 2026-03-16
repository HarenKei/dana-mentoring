import type { SessionOptions } from 'iron-session';

export type SessionData = {
  isAdmin?: boolean;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'dana-mentoring-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};
