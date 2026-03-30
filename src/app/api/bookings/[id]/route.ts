import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
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

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      seatNumber,
      passengerName,
      passengerPhone,
      pickupStationId,
      dropoffStationId,
      price,
      status,
    } = body;

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        ...(seatNumber && { seatNumber: seatNumber.toUpperCase() }),
        ...(passengerName !== undefined && { passengerName }),
        ...(passengerPhone !== undefined && { passengerPhone }),
        ...(pickupStationId && { pickupStationId }),
        ...(dropoffStationId && { dropoffStationId }),
        ...(price !== undefined && { price }),
        ...(status && { status }),
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

    return NextResponse.json(booking);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Seat already booked for this schedule" },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
