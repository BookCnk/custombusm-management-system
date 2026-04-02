import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { validateBookingStations } from "../../_lib/bookings";
import { bookingInclude } from "../../_lib/includes";
import { jsonError, parsePositiveInt, prismaErrorCode } from "../../_lib/http";
import {
  isBookingStatus,
  normalizeNonEmptyString,
  normalizeNonNegativeNumber,
  normalizeOptionalString,
  normalizePositiveInt,
} from "../../_lib/validation";

function parseBookingUpdatePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" } as const;
  }

  const payload = body as Record<string, unknown>;
  const seatNumber = normalizeNonEmptyString(payload.seatNumber)?.toUpperCase();
  const passengerName = normalizeOptionalString(payload.passengerName);
  const passengerPhone = normalizeOptionalString(payload.passengerPhone);
  const pickupStationId = normalizePositiveInt(payload.pickupStationId);
  const dropoffStationId = normalizePositiveInt(payload.dropoffStationId);
  const price = normalizeNonNegativeNumber(payload.price);
  const status = payload.status;

  if ("seatNumber" in payload && !seatNumber) {
    return { error: "seatNumber must be a non-empty string" } as const;
  }

  if ("pickupStationId" in payload && !pickupStationId) {
    return { error: "pickupStationId must be a positive integer" } as const;
  }

  if ("dropoffStationId" in payload && !dropoffStationId) {
    return { error: "dropoffStationId must be a positive integer" } as const;
  }

  if ("price" in payload && price === undefined) {
    return { error: "price must be a non-negative number" } as const;
  }

  if ("status" in payload && !isBookingStatus(status)) {
    return {
      error: "status must be one of: CONFIRMED, CANCELLED",
    } as const;
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

  const data: Prisma.BookingUpdateInput = {};

  if (seatNumber) {
    data.seatNumber = seatNumber;
  }

  if (passengerName !== undefined) {
    data.passengerName = passengerName;
  }

  if (passengerPhone !== undefined) {
    data.passengerPhone = passengerPhone;
  }

  if (pickupStationId) {
    data.pickupStation = {
      connect: { id: pickupStationId },
    };
  }

  if (dropoffStationId) {
    data.dropoffStation = {
      connect: { id: dropoffStationId },
    };
  }

  if (price !== undefined) {
    data.price = price;
  }

  if (status && isBookingStatus(status)) {
    data.status = status;
  }

  if (Object.keys(data).length === 0) {
    return { error: "No valid fields provided for update" } as const;
  }

  return {
    data,
    pickupStationId,
    dropoffStationId,
  } as const;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parsePositiveInt(id);

  if (!bookingId) {
    return jsonError("Invalid booking id", 400);
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      return jsonError("Booking not found", 404);
    }

    return NextResponse.json(booking);
  } catch {
    return jsonError("Failed to fetch booking", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parsePositiveInt(id);

  if (!bookingId) {
    return jsonError("Invalid booking id", 400);
  }

  const body = await request.json();
  const parsed = parseBookingUpdatePayload(body);

  if ("error" in parsed) {
    return jsonError(parsed.error ?? "Invalid booking payload", 400);
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          scheduleId: true,
          pickupStationId: true,
          dropoffStationId: true,
        },
      });

      if (!existingBooking) {
        throw new Error("404:Booking not found");
      }

      const nextPickupStationId =
        parsed.pickupStationId ?? existingBooking.pickupStationId;
      const nextDropoffStationId =
        parsed.dropoffStationId ?? existingBooking.dropoffStationId;

      const validation = await validateBookingStations(
        tx,
        existingBooking.scheduleId,
        nextPickupStationId,
        nextDropoffStationId,
      );

      if ("error" in validation) {
        throw new Error(`${validation.status}:${validation.error}`);
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: parsed.data,
        include: bookingInclude,
      });
    });

    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof Error) {
      const [status, ...messageParts] = error.message.split(":");
      const message = messageParts.join(":");

      if (status && message && /^\d+$/.test(status)) {
        return jsonError(message, Number(status));
      }
    }

    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Booking not found", 404);
    }
    if (code === "P2002") {
      return jsonError("Seat already booked for this schedule", 409);
    }
    if (code === "P2003") {
      return jsonError("Station not found", 404);
    }

    return jsonError("Failed to update booking", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parsePositiveInt(id);

  if (!bookingId) {
    return jsonError("Invalid booking id", 400);
  }

  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === "P2025") {
      return jsonError("Booking not found", 404);
    }

    return jsonError("Failed to delete booking", 500);
  }
}
