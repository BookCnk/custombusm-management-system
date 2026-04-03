import { NextRequest, NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_PAGE_PATHS = new Set(["/login", "/register"]);
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/keep-alive",
]);

function getApiBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim() || null;
}

async function isAuthenticated(request: NextRequest) {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const bearerToken = request.nextUrl.pathname.startsWith("/api/")
    ? getApiBearerToken(request)
    : null;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return false;
  }

  try {
    await verifyAuthToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = await isAuthenticated(request);

  if (PUBLIC_PAGE_PATHS.has(pathname)) {
    if (authed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (authed) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/buses/:path*",
    "/routes/:path*",
    "/stations/:path*",
    "/schedules/:path*",
    "/bookings/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
