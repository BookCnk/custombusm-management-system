import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "custombusm_auth";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthCookieRequestLike = Pick<NextRequest, "headers" | "nextUrl" | "url">;

function parseBooleanEnv(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
}

function requestUsesHttps(request?: AuthCookieRequestLike) {
  if (!request) {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return request.nextUrl.protocol === "https:";
}

export function getAuthCookieOptions(request?: AuthCookieRequestLike) {
  const secureOverride = parseBooleanEnv(process.env.AUTH_COOKIE_SECURE);
  const secure =
    secureOverride ?? (request ? requestUsesHttps(request) : process.env.NODE_ENV === "production");

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  };
}
