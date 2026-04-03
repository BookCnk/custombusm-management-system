import { jwtVerify, SignJWT } from "jose";

import { AUTH_TOKEN_TTL_SECONDS } from "@/lib/auth/session";

export type AuthTokenPayload = {
  sub: string;
  username: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET");
  }

  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  const subject = payload.sub;
  const username = payload.username;

  if (typeof subject !== "string" || typeof username !== "string") {
    throw new Error("Invalid auth token payload");
  }

  return {
    sub: subject,
    username,
  } satisfies AuthTokenPayload;
}
