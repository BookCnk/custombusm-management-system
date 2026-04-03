import { prisma } from "@/lib/prisma";
import { signAuthToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { NextRequest, NextResponse } from "next/server";

import { applyAuthCookie } from "../_lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: await hashPassword(password),
      },
    });

    const token = await signAuthToken({
      sub: user.id.toString(),
      username: user.username,
    });

    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        message: "User created successfully",
      },
      { status: 201 },
    );

    return applyAuthCookie(response, token);
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
