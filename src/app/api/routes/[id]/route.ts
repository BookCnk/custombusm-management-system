import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { routeDetailInclude, routeListInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import { normalizeNonEmptyString } from "../../_lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const routeId = parsePositiveInt(id);

  if (!routeId) {
    return jsonError("Invalid route id", 400);
  }

  try {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: routeDetailInclude,
    });

    if (!route) {
      return jsonError("Route not found", 404);
    }

    return NextResponse.json(route);
  } catch {
    return jsonError("Failed to fetch route", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const routeId = parsePositiveInt(id);

  if (!routeId) {
    return jsonError("Invalid route id", 400);
  }

  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return jsonError("Request body must be a JSON object", 400);
  }

  const payload = body as Record<string, unknown>;
  const routeName = normalizeNonEmptyString(payload.routeName);

  if ("routeName" in payload && !routeName) {
    return jsonError("routeName must be a non-empty string", 400);
  }

  if (!routeName) {
    return jsonError("No valid fields provided for update", 400);
  }

  try {
    const route = await prisma.route.update({
      where: { id: routeId },
      data: {
        routeName,
      },
      include: routeListInclude,
    });

    return NextResponse.json(route);
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Route not found", 404);
    }

    return jsonError("Failed to update route", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const routeId = parsePositiveInt(id);

  if (!routeId) {
    return jsonError("Invalid route id", 400);
  }

  try {
    await prisma.route.delete({
      where: { id: routeId },
    });

    return NextResponse.json({ message: "Route deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Route not found", 404);
    }
    if (code === "P2003") {
      return jsonError("Cannot delete route with existing schedules", 409);
    }

    return jsonError("Failed to delete route", 500);
  }
}
