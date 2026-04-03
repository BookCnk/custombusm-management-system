import { NextRequest, NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/session";

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim() || null;
}

export function applyAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export async function getAuthenticatedUser(request: NextRequest) {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const bearerToken = getBearerToken(request);
  const token = bearerToken ?? cookieToken;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);
    const id = Number(payload.sub);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return {
      id,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
