import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "../_lib/session";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json(user);
}
