import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { stationInclude } from "../_lib/includes";
import {
  jsonError,
  parseOptionalPositiveInt,
  prismaErrorCode,
} from "../_lib/http";
import {
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../_lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = parseOptionalPositiveInt(searchParams.get("routeId"));
  const q = searchParams.get("q")?.trim();

  if (searchParams.get("routeId") !== null && routeId === null) {
    return jsonError("routeId must be a positive integer", 400);
  }

  try {
    const stations = await prisma.routeStation.findMany({
      where: {
        stopOrder: { gt: 0 },
        ...(routeId && { routeId }),
        ...(q && {
          OR: [
            {
              stationName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              route: {
                routeName: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
      },
      include: stationInclude,
      orderBy: [{ routeId: "asc" }, { stopOrder: "asc" }],
    });

    return NextResponse.json(stations);
  } catch {
    return jsonError("Failed to fetch stations", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return jsonError("Request body must be a JSON object", 400);
  }

  const payload = body as Record<string, unknown>;
  const routeId = normalizePositiveInt(payload.routeId);
  const stationName = normalizeNonEmptyString(payload.stationName);
  const stopOrder = normalizePositiveInt(payload.stopOrder);

  if (!routeId || !stationName || !stopOrder) {
    return jsonError("routeId, stationName, and stopOrder are required", 400);
  }

  try {
    const station = await prisma.routeStation.create({
      data: {
        routeId,
        stationName,
        stopOrder,
      },
      include: stationInclude,
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2003") {
      return jsonError("Route not found", 404);
    }
    if (code === "P2002") {
      return jsonError("stopOrder already exists for this route", 409);
    }

    return jsonError("Failed to create station", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = parseOptionalPositiveInt(searchParams.get("stationId"));

  if (!stationId) {
    return jsonError("stationId must be a positive integer", 400);
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
      // Cannot delete due to existing bookings - hide it with a unique negative stopOrder.
      try {
        await prisma.routeStation.update({
          where: { id: stationId },
          data: { stopOrder: -stationId },
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
