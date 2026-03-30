import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: true,
        route: {
          include: {
            stations: {
              orderBy: { stopOrder: "asc" },
            },
          },
        },
        bookings: {
          include: {
            pickupStation: true,
            dropoffStation: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
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
    const { busId, routeId, departureDate, departureTime } = body;

    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        ...(busId && { busId }),
        ...(routeId && { routeId }),
        ...(departureDate && { departureDate: new Date(departureDate) }),
        ...(departureTime && { departureTime }),
      },
      include: {
        bus: true,
        route: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Bus or Route not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update schedule" },
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
    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete schedule with existing bookings" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
