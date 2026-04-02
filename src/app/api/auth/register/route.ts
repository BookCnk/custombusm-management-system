import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
        password,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
