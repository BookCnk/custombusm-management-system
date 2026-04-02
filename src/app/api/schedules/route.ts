import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { scheduleDetailInclude, scheduleListInclude } from "../_lib/includes";
import {
  jsonError,
  parseOptionalPositiveInt,
  prismaErrorCode,
} from "../_lib/http";
import {
  isTimeString,
  normalizeDateInput,
  normalizePositiveInt,
} from "../_lib/validation";

function parseSchedulePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const busId = normalizePositiveInt(payload.busId);
  const routeId = normalizePositiveInt(payload.routeId);
  const departureDate = normalizeDateInput(payload.departureDate);
  const departureTime = payload.departureTime;

  if (!busId || !routeId || !departureDate || !isTimeString(departureTime)) {
    return {
      error: "busId, routeId, departureDate, and departureTime are required",
    } as const;
  }

  const data: Prisma.ScheduleCreateInput = {
    departureDate,
    departureTime,
    bus: {
      connect: { id: busId },
    },
    route: {
      connect: { id: routeId },
    },
  };

  return { data } as const;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = parseOptionalPositiveInt(searchParams.get("routeId"));
  const busId = parseOptionalPositiveInt(searchParams.get("busId"));
  const date = searchParams.get("date");

  if (searchParams.get("routeId") !== null && routeId === null) {
    return jsonError("routeId must be a positive integer", 400);
  }

  if (searchParams.get("busId") !== null && busId === null) {
    return jsonError("busId must be a positive integer", 400);
  }

  const parsedDate = date ? normalizeDateInput(date) : undefined;
  if (date && !parsedDate) {
    return jsonError("date must be a valid ISO date string", 400);
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        ...(routeId && { routeId }),
        ...(busId && { busId }),
        ...(parsedDate && {
          departureDate: {
            gte: parsedDate,
            lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: scheduleListInclude,
      orderBy: [{ departureDate: "desc" }, { departureTime: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch {
    return jsonError("Failed to fetch schedules", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = parseSchedulePayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid schedule payload", 400);
  }

  try {
    const schedule = await prisma.schedule.create({
      data: parsed.data,
      include: scheduleDetailInclude,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2002") {
      return jsonError("This bus already has a schedule at that date and time", 409);
    }
    if (code === "P2003") {
      return jsonError("Bus or Route not found", 404);
    }

    return jsonError("Failed to create schedule", 500);
  }
}
