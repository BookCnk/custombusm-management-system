export const AUTH_COOKIE_NAME = "custombusm_auth";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  };
}
