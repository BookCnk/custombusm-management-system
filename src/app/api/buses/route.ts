import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { jsonError, prismaErrorCode } from "../_lib/http";
import {
  isBusStatus,
  normalizeJsonInput,
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../_lib/validation";

function extractLayoutTotalSeats(layout: unknown) {
  if (
    typeof layout === "object" &&
    layout !== null &&
    !Array.isArray(layout) &&
    typeof (layout as { totalSeats?: unknown }).totalSeats === "number" &&
    Number.isInteger((layout as { totalSeats: number }).totalSeats) &&
    (layout as { totalSeats: number }).totalSeats > 0
  ) {
    return (layout as { totalSeats: number }).totalSeats;
  }

  return undefined;
}

function parseBusPayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const busNumber = normalizeNonEmptyString(payload.busNumber);
  const type = normalizeNonEmptyString(payload.type);
  const status = payload.status;
  const totalSeats = normalizePositiveInt(payload.totalSeats);
  const layout = normalizeJsonInput(payload.layout);
  const layoutTotalSeats = extractLayoutTotalSeats(payload.layout);

  if (!busNumber) {
    return { error: "busNumber is required" } as const;
  }

  if ("totalSeats" in payload && totalSeats === undefined) {
    return { error: "totalSeats must be a positive integer" } as const;
  }

  if ("type" in payload && !type) {
    return { error: "type must be a non-empty string" } as const;
  }

  if ("status" in payload && !isBusStatus(status)) {
    return {
      error: "status must be one of: active, maintenance",
    } as const;
  }

  if ("layout" in payload && layout === undefined) {
    return { error: "layout must be valid JSON" } as const;
  }

  if (
    totalSeats !== undefined &&
    layoutTotalSeats !== undefined &&
    totalSeats !== layoutTotalSeats
  ) {
    return {
      error: "totalSeats must match layout.totalSeats when both are provided",
    } as const;
  }

  const data: Prisma.BusCreateInput = { busNumber };

  if (type) {
    data.type = type;
  }

  if (status && isBusStatus(status)) {
    data.status = status;
  }

  if (totalSeats ?? layoutTotalSeats) {
    data.totalSeats = totalSeats ?? layoutTotalSeats!;
  }

  if (layout !== undefined) {
    data.layout = layout;
  }

  return { data } as const;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get("status");
  const type = searchParams.get("type")?.trim();

  if (rawStatus && !isBusStatus(rawStatus)) {
    return jsonError("status must be one of: active, maintenance", 400);
  }

  const status = rawStatus && isBusStatus(rawStatus) ? rawStatus : undefined;

  try {
    const buses = await prisma.bus.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: { busNumber: "asc" },
    });

    return NextResponse.json(buses);
  } catch {
    return jsonError("Failed to fetch buses", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = parseBusPayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid bus payload", 400);
  }

  try {
    const bus = await prisma.bus.create({
      data: parsed.data,
    });

    return NextResponse.json(bus, { status: 201 });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2002") {
      return jsonError("Bus number already exists", 409);
    }

    return jsonError("Failed to create bus", 500);
  }
}
