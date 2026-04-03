import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { needsPasswordRehash, verifyPassword, hashPassword } from "@/lib/auth/password";
import { NextRequest, NextResponse } from "next/server";

import { applyAuthCookie } from "../_lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (needsPasswordRehash(user.password)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: await hashPassword(password),
        },
      });
    }

    const token = await signAuthToken({
      sub: user.id.toString(),
      username: user.username,
    });

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      message: "Login successful",
    });

    return applyAuthCookie(response, token);
  } catch {
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
