import { BookingStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { validateBookingStations } from "../_lib/bookings";
import { bookingInclude } from "../_lib/includes";
import {
  jsonError,
  parseOptionalPositiveInt,
  prismaErrorCode,
} from "../_lib/http";
import {
  isBookingStatus,
  normalizeNonEmptyString,
  normalizeNonNegativeNumber,
  normalizeOptionalString,
  normalizePositiveInt,
} from "../_lib/validation";

function parseBookingPayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const scheduleId = normalizePositiveInt(payload.scheduleId);
  const seatNumber = normalizeNonEmptyString(payload.seatNumber)?.toUpperCase();
  const passengerName = normalizeOptionalString(payload.passengerName);
  const passengerPhone = normalizeOptionalString(payload.passengerPhone);
  const pickupStationId = normalizePositiveInt(payload.pickupStationId);
  const dropoffStationId = normalizePositiveInt(payload.dropoffStationId);
  const pickupStationName = normalizeNonEmptyString(payload.pickupStationName);
  const dropoffStationName = normalizeNonEmptyString(
    payload.dropoffStationName,
  );
  const price =
    payload.price === undefined ? 0 : normalizeNonNegativeNumber(payload.price);

  if (
    !scheduleId ||
    !seatNumber ||
    !pickupStationId ||
    !dropoffStationId ||
    !pickupStationName ||
    !dropoffStationName
  ) {
    return {
      error:
        "scheduleId, seatNumber, pickupStationId, dropoffStationId, pickupStationName, and dropoffStationName are required",
    } as const;
  }

  if (payload.price !== undefined && price === undefined) {
    return { error: "price must be a non-negative number" } as const;
  }

  if ("passengerName" in payload && passengerName === undefined) {
    return {
      error: "passengerName must be a string, null, or omitted",
    } as const;
  }

  if ("passengerPhone" in payload && passengerPhone === undefined) {
    return {
      error: "passengerPhone must be a string, null, or omitted",
    } as const;
  }

  const data: Prisma.BookingCreateInput = {
    seatNumber,
    passengerName,
    passengerPhone,
    pickupStationName,
    dropoffStationName,
    price,
    status: BookingStatus.CONFIRMED,
    schedule: {
      connect: { id: scheduleId },
    },
    pickupStation: {
      connect: { id: pickupStationId },
    },
    dropoffStation: {
      connect: { id: dropoffStationId },
    },
  };

  return {
    data,
    scheduleId,
    pickupStationId,
    dropoffStationId,
  } as const;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scheduleId = parseOptionalPositiveInt(searchParams.get("scheduleId"));
  const passengerPhone = searchParams.get("passengerPhone")?.trim();
  const rawStatus = searchParams.get("status");

  if (searchParams.get("scheduleId") !== null && scheduleId === null) {
    return jsonError("scheduleId must be a positive integer", 400);
  }

  if (rawStatus && !isBookingStatus(rawStatus)) {
    return jsonError("status must be one of: CONFIRMED, CANCELLED", 400);
  }

  const status =
    rawStatus && isBookingStatus(rawStatus) ? rawStatus : undefined;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ...(scheduleId && { scheduleId }),
        ...(passengerPhone && { passengerPhone }),
        ...(status && { status }),
      },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch {
    return jsonError("Failed to fetch bookings", 500);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = parseBookingPayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid booking payload", 400);
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const validation = await validateBookingStations(
        tx,
        parsed.scheduleId,
        parsed.pickupStationId,
        parsed.dropoffStationId,
      );

      if ("error" in validation) {
        throw new Error(`${validation.status}:${validation.error}`);
      }

      return tx.booking.create({
        data: parsed.data,
        include: bookingInclude,
      });
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const [status, ...messageParts] = error.message.split(":");
      const message = messageParts.join(":");

      if (status && message && /^\d+$/.test(status)) {
        return jsonError(message, Number(status));
      }
    }

    const code = prismaErrorCode(error);

    if (code === "P2002") {
      return jsonError("Seat already booked for this schedule", 409);
    }
    if (code === "P2003") {
      return jsonError("Schedule or Station not found", 404);
    }

    return jsonError("Failed to create booking", 500);
  }
}
