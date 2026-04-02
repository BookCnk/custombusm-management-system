import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { routeDetailInclude, routeListInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import {
  isObjectArray,
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../../_lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
  { params }: { params: Promise<{ id: string }> },
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

  // Parse stations if provided
  let stationsToUpdate:
    | Array<{ id?: number; stationName: string; stopOrder: number }>
    | undefined;
  if (payload.stations !== undefined) {
    if (!isObjectArray(payload.stations)) {
      return jsonError("stations must be an array of objects", 400);
    }

    const sanitizedStations: Array<{
      id?: number;
      stationName: string;
      stopOrder: number;
    }> = [];

    for (const [index, station] of payload.stations.entries()) {
      const stationName = normalizeNonEmptyString(station.stationName);
      const stopOrder =
        station.stopOrder === undefined
          ? index + 1
          : normalizePositiveInt(station.stopOrder);
      const stationId = station.id
        ? normalizePositiveInt(station.id)
        : undefined;

      if (!stationName) {
        return jsonError(`stations[${index}].stationName is required`, 400);
      }

      if (!stopOrder) {
        return jsonError(
          `stations[${index}].stopOrder must be a positive integer`,
          400,
        );
      }

      sanitizedStations.push({ id: stationId, stationName, stopOrder });
    }

    const uniqueStopOrders = new Set(sanitizedStations.map((s) => s.stopOrder));
    if (uniqueStopOrders.size !== sanitizedStations.length) {
      return jsonError(
        "Each station stopOrder must be unique within the route",
        400,
      );
    }

    stationsToUpdate = sanitizedStations;
  }

  if (!routeName && stationsToUpdate === undefined) {
    return jsonError("No valid fields provided for update", 400);
  }

  try {
    // Get existing stations to determine what to delete/update/create
    // Query without filter to get ALL stations including inactive ones
    const existingRoute = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
    });

    if (!existingRoute) {
      return jsonError("Route not found", 404);
    }

    // Use transaction to update route and stations
    const route = await prisma.$transaction(async (tx) => {
      // Update route name if provided
      if (routeName) {
        await tx.route.update({
          where: { id: routeId },
          data: { routeName },
        });
      }

      // Update stations if provided
      if (stationsToUpdate !== undefined) {
        const existingStations = existingRoute.stations;

        // Separate stations with id (update) and without id (new)
        const stationsToModify = stationsToUpdate.filter(
          (s) => s.id !== undefined,
        );
        const newStations = stationsToUpdate.filter((s) => s.id === undefined);

        // Find stations to delete (existing but not in new list by id)
        const stationsToDelete = existingStations.filter(
          (es) => !stationsToModify.some((ns) => ns.id === es.id),
        );

        // Update existing stations
        for (const station of stationsToModify) {
          const existingStation = existingStations.find(
            (es) => es.id === station.id,
          );
          if (existingStation) {
            // Update if name or stopOrder changed
            if (
              existingStation.stationName !== station.stationName ||
              existingStation.stopOrder !== station.stopOrder
            ) {
              await tx.routeStation.update({
                where: { id: station.id },
                data: {
                  stationName: station.stationName,
                  stopOrder: station.stopOrder,
                },
              });
            }
          }
        }

        // Delete stations that are not in the new list
        for (const station of stationsToDelete) {
          try {
            await tx.routeStation.delete({
              where: { id: station.id },
            });
          } catch {
            // If delete fails (has bookings), mark as inactive by setting stopOrder to -1
            await tx.routeStation.update({
              where: { id: station.id },
              data: { stopOrder: -1 },
            });
          }
        }

        // Create new stations
        if (newStations.length > 0) {
          await tx.routeStation.createMany({
            data: newStations.map((s) => ({
              routeId,
              stationName: s.stationName,
              stopOrder: s.stopOrder,
            })),
          });
        }
      }

      // Return updated route
      return await tx.route.findUnique({
        where: { id: routeId },
        include: routeListInclude,
      });
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
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const routeId = parsePositiveInt(id);

  if (!routeId) {
    return jsonError("Invalid route id", 400);
  }

  try {
    // Use transaction to delete bookings, schedules, then route
    await prisma.$transaction(async (tx) => {
      // First delete all bookings for schedules of this route
      await tx.booking.deleteMany({
        where: {
          schedule: { routeId },
        },
      });

      // Then delete all schedules for this route
      await tx.schedule.deleteMany({
        where: { routeId },
      });

      // Now delete the route (stations will be cascade deleted)
      await tx.route.delete({
        where: { id: routeId },
      });
    });

    return NextResponse.json({ message: "Route deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Route not found", 404);
    }

    return jsonError("Failed to delete route", 500);
  }
}
