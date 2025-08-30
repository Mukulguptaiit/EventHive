import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "ATTENDEE" | "EVENT_ORGANIZER" | "ADMIN";

// Define protected routes and their required roles
const protectedRoutes: Record<string, Role[]> = {
  "/dashboard": ["ATTENDEE", "EVENT_ORGANIZER", "ADMIN"],
  "/admin": ["ADMIN"],
  "/admin/users": ["ADMIN"],
  "/admin/facilities": ["ADMIN"],
  "/facility": ["EVENT_ORGANIZER", "ADMIN"],
  "/profile": ["ATTENDEE", "EVENT_ORGANIZER", "ADMIN"],
  "/bookings": ["ATTENDEE", "EVENT_ORGANIZER", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const route = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route),
  );

  if (!route) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|auth).*)",
  ],
};
