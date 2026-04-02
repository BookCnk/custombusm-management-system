import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { busDetailInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import {
  isBusStatus,
  normalizeJsonInput,
  normalizeNonEmptyString,
  normalizePositiveInt,
} from "../../_lib/validation";

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

function parseBusUpdatePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const busNumber = normalizeNonEmptyString(payload.busNumber);
  const type = normalizeNonEmptyString(payload.type);
  const totalSeats = normalizePositiveInt(payload.totalSeats);
  const status = payload.status;
  const layout = normalizeJsonInput(payload.layout);
  const layoutTotalSeats = extractLayoutTotalSeats(payload.layout);

  if ("busNumber" in payload && !busNumber) {
    return { error: "busNumber must be a non-empty string" } as const;
  }

  if ("type" in payload && !type) {
    return { error: "type must be a non-empty string" } as const;
  }

  if ("totalSeats" in payload && totalSeats === undefined) {
    return { error: "totalSeats must be a positive integer" } as const;
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

  const data: Prisma.BusUpdateInput = {};

  if (busNumber) {
    data.busNumber = busNumber;
  }

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
  const busId = parsePositiveInt(id);

  if (!busId) {
    return jsonError("Invalid bus id", 400);
  }

  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: busDetailInclude,
    });

    if (!bus) {
      return jsonError("Bus not found", 404);
    }

    return NextResponse.json(bus);
  } catch {
    return jsonError("Failed to fetch bus", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const busId = parsePositiveInt(id);

  if (!busId) {
    return jsonError("Invalid bus id", 400);
  }

  const body = await request.json();
  const parsed = parseBusUpdatePayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid bus payload", 400);
  }

  try {
    const bus = await prisma.bus.update({
      where: { id: busId },
      data: parsed.data,
    });

    return NextResponse.json(bus);
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Bus not found", 404);
    }
    if (code === "P2002") {
      return jsonError("Bus number already exists", 409);
    }

    return jsonError("Failed to update bus", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const busId = parsePositiveInt(id);

  if (!busId) {
    return jsonError("Invalid bus id", 400);
  }

  try {
    await prisma.bus.delete({
      where: { id: busId },
    });

    return NextResponse.json({ message: "Bus deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Bus not found", 404);
    }
    if (code === "P2003") {
      return jsonError("Cannot delete bus with existing schedules", 409);
    }

    return jsonError("Failed to delete bus", 500);
  }
}
