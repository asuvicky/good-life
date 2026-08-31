import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );
  const { pathname } = request.nextUrl;

  if (!session.staffId) {
    const login = new URL("/", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/chair") && session.role !== "CHAIR") {
    return NextResponse.redirect(new URL("/admin/parcels", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/chair/:path*"],
};
