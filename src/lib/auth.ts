import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  staffId?: string;
  name?: string;
  username?: string;
  role?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-secret-please-change-32ch",
  cookieName: "good-life-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireStaff(allowed?: string[]) {
  const session = await getSession();
  if (!session.staffId || !session.role) {
    return null;
  }
  if (allowed && !allowed.includes(session.role)) {
    return null;
  }
  return session;
}
