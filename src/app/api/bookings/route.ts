import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const passengerPhone = searchParams.get("passengerPhone");

    const bookings = await prisma.booking.findMany({
      where: {
        ...(scheduleId && { scheduleId: parseInt(scheduleId) }),
        ...(passengerPhone && { passengerPhone }),
      },
      include: {
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
        pickupStation: true,
        dropoffStation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scheduleId,
      seatNumber,
      passengerName,
      passengerPhone,
      pickupStationId,
      dropoffStationId,
      price = 0,
    } = body;

    if (!scheduleId || !seatNumber || !pickupStationId || !dropoffStationId) {
      return NextResponse.json(
        { error: "scheduleId, seatNumber, pickupStationId, and dropoffStationId are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        scheduleId,
        seatNumber: seatNumber.toUpperCase(),
        passengerName,
        passengerPhone,
        pickupStationId,
        dropoffStationId,
        price,
        status: "CONFIRMED",
      },
      include: {
        schedule: {
          include: {
            bus: true,
            route: true,
          },
        },
        pickupStation: true,
        dropoffStation: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Seat already booked for this schedule" },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Schedule or Station not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
