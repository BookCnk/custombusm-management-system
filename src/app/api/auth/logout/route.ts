import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "../_lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    message: "Logout successful",
  });

  return clearAuthCookie(response, request);
}
