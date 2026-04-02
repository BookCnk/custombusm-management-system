import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { routeListInclude } from "../_lib/includes";
import { jsonError } from "../_lib/http";
import {
  isObjectArray,
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../_lib/validation";

function parseStationsInput(value: unknown) {
  if (value === undefined) {
    return { stations: undefined } as const;
  }

  if (!isObjectArray(value)) {
    return { error: "stations must be an array of objects" } as const;
  }

  const sanitizedStations: Array<{ stationName: string; stopOrder: number }> = [];

  for (const [index, station] of value.entries()) {
    const stationName = normalizeNonEmptyString(station.stationName);
    const stopOrder =
      station.stopOrder === undefined
        ? index + 1
        : normalizePositiveInt(station.stopOrder);

    if (!stationName) {
      return { error: `stations[${index}].stationName is required` } as const;
    }

    if (!stopOrder) {
      return {
        error: `stations[${index}].stopOrder must be a positive integer`,
      } as const;
    }

    sanitizedStations.push({ stationName, stopOrder });
  }

  const uniqueStopOrders = new Set(
    sanitizedStations.map((station) => station.stopOrder),
  );

  if (uniqueStopOrders.size !== sanitizedStations.length) {
    return {
      error: "Each station stopOrder must be unique within the route",
    } as const;
  }

  return { stations: sanitizedStations } as const;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  try {
    const routes = await prisma.route.findMany({
      where: q
        ? {
            routeName: {
              contains: q,
              mode: "insensitive",
            },
          }
        : undefined,
      include: routeListInclude,
      orderBy: { routeName: "asc" },
    });

    return NextResponse.json(routes);
  } catch {
    return jsonError("Failed to fetch routes", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (typeof body !== "object" || body === null) {
    return jsonError("Request body must be a JSON object", 400);
  }

  const payload = body as Record<string, unknown>;
  const routeName = normalizeNonEmptyString(payload.routeName);
  const parsedStations = parseStationsInput(payload.stations);

  if (!routeName) {
    return jsonError("routeName is required", 400);
  }

  if ("error" in parsedStations) {
    return jsonError(parsedStations.error ?? "Invalid stations payload", 400);
  }

  try {
    const route = await prisma.route.create({
      data: {
        routeName,
        ...(parsedStations.stations?.length && {
          stations: {
            create: parsedStations.stations,
          },
        }),
      },
      include: routeListInclude,
    });

    return NextResponse.json(route, { status: 201 });
  } catch {
    return jsonError("Failed to create route", 500);
  }
}
