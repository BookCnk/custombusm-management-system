import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { stationInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import {
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../../_lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = parsePositiveInt(id);

  if (!stationId) {
    return jsonError("Invalid station id", 400);
  }

  try {
    const station = await prisma.routeStation.findUnique({
      where: { id: stationId },
      include: stationInclude,
    });

    if (!station) {
      return jsonError("Station not found", 404);
    }

    return NextResponse.json(station);
  } catch {
    return jsonError("Failed to fetch station", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = parsePositiveInt(id);

  if (!stationId) {
    return jsonError("Invalid station id", 400);
  }

  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return jsonError("Request body must be a JSON object", 400);
  }

  const payload = body as Record<string, unknown>;
  const routeId = normalizePositiveInt(payload.routeId);
  const stationName = normalizeNonEmptyString(payload.stationName);
  const stopOrder = normalizePositiveInt(payload.stopOrder);

  if ("routeId" in payload && !routeId) {
    return jsonError("routeId must be a positive integer", 400);
  }

  if ("stationName" in payload && !stationName) {
    return jsonError("stationName must be a non-empty string", 400);
  }

  if ("stopOrder" in payload && !stopOrder) {
    return jsonError("stopOrder must be a positive integer", 400);
  }

  const data = {
    ...(routeId && { routeId }),
    ...(stationName && { stationName }),
    ...(stopOrder && { stopOrder }),
  };

  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields provided for update", 400);
  }

  try {
    const station = await prisma.routeStation.update({
      where: { id: stationId },
      data,
      include: stationInclude,
    });

    return NextResponse.json(station);
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Station not found", 404);
    }
    if (code === "P2003") {
      return jsonError("Route not found", 404);
    }
    if (code === "P2002") {
      return jsonError("stopOrder already exists for this route", 409);
    }

    return jsonError("Failed to update station", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = parsePositiveInt(id);

  if (!stationId) {
    return jsonError("Invalid station id", 400);
  }

  try {
    await prisma.routeStation.delete({
      where: { id: stationId },
    });

    return NextResponse.json({ message: "Station deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Station not found", 404);
    }
    if (code === "P2003") {
      // Cannot delete due to existing bookings - mark as inactive instead
      try {
        await prisma.routeStation.update({
          where: { id: stationId },
          data: { stopOrder: -1 },
        });
        return NextResponse.json({
          message: "Station marked as inactive due to existing bookings",
        });
      } catch {
        return jsonError("Failed to mark station as inactive", 500);
      }
    }

    return jsonError("Failed to delete station", 500);
  }
}
