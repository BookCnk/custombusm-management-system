import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { scheduleDetailInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import {
  isTimeString,
  normalizeDateInput,
  normalizePositiveInt,
} from "../../_lib/validation";

function parseScheduleUpdatePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const busId = normalizePositiveInt(payload.busId);
  const routeId = normalizePositiveInt(payload.routeId);
  const departureDate = normalizeDateInput(payload.departureDate);
  const departureTime = payload.departureTime;

  if ("busId" in payload && !busId) {
    return { error: "busId must be a positive integer" } as const;
  }

  if ("routeId" in payload && !routeId) {
    return { error: "routeId must be a positive integer" } as const;
  }

  if ("departureDate" in payload && !departureDate) {
    return { error: "departureDate must be a valid ISO date string" } as const;
  }

  if ("departureTime" in payload && !isTimeString(departureTime)) {
    return { error: "departureTime must be in HH:MM format" } as const;
  }

  const data: Prisma.ScheduleUpdateInput = {};

  if (busId) {
    data.bus = {
      connect: { id: busId },
    };
  }

  if (routeId) {
    data.route = {
      connect: { id: routeId },
    };
  }

  if (departureDate) {
    data.departureDate = departureDate;
  }

  if (departureTime) {
    data.departureTime = departureTime;
  }

  if (Object.keys(data).length === 0) {
    return { error: "No valid fields provided for update" } as const;
  }

  return { data } as const;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const scheduleId = parsePositiveInt(id);

  if (!scheduleId) {
    return jsonError("Invalid schedule id", 400);
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: scheduleDetailInclude,
    });

    if (!schedule) {
      return jsonError("Schedule not found", 404);
    }

    return NextResponse.json(schedule);
  } catch {
    return jsonError("Failed to fetch schedule", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const scheduleId = parsePositiveInt(id);

  if (!scheduleId) {
    return jsonError("Invalid schedule id", 400);
  }

  const body = await request.json();
  const parsed = parseScheduleUpdatePayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid schedule payload", 400);
  }

  try {
    const schedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: parsed.data,
      include: scheduleDetailInclude,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Schedule not found", 404);
    }
    if (code === "P2002") {
      return jsonError(
        "This bus already has a schedule at that date and time",
        409,
      );
    }
    if (code === "P2003") {
      return jsonError("Bus or Route not found", 404);
    }

    return jsonError("Failed to update schedule", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const scheduleId = parsePositiveInt(id);

  if (!scheduleId) {
    return jsonError("Invalid schedule id", 400);
  }

  try {
    // Delete related bookings first
    await prisma.booking.deleteMany({
      where: { scheduleId },
    });

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Schedule not found", 404);
    }
    if (code === "P2003") {
      return jsonError("Cannot delete schedule with existing bookings", 409);
    }

    return jsonError("Failed to delete schedule", 500);
  }
}
