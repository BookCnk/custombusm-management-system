import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");
    const busId = searchParams.get("busId");
    const date = searchParams.get("date");

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(routeId && { routeId: parseInt(routeId) }),
        ...(busId && { busId: parseInt(busId) }),
        ...(date && {
          departureDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
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
          select: {
            seatNumber: true,
            status: true,
          },
        },
      },
      orderBy: { departureDate: "desc" },
    });

    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, routeId, departureDate, departureTime } = body;

    if (!busId || !routeId || !departureDate || !departureTime) {
      return NextResponse.json(
        { error: "busId, routeId, departureDate, and departureTime are required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        busId,
        routeId,
        departureDate: new Date(departureDate),
        departureTime,
      },
      include: {
        bus: true,
        route: true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Bus or Route not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
