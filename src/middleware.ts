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

  if (pathname.startsWith("/my")) {
    if (!session.residentId) {
      const login = new URL("/", request.url);
      login.searchParams.set("error", "needlogin");
      return NextResponse.redirect(login);
    }
    return response;
  }

  if (!session.staffId) {
    const login = new URL("/staff", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/chair") && session.role !== "CHAIR") {
    return NextResponse.redirect(new URL("/admin/parcels", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/chair/:path*", "/my/:path*"],
};
