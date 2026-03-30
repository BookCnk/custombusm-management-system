import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const station = await prisma.routeStation.findUnique({
      where: { id: parseInt(id) },
      include: { route: true },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    return NextResponse.json(station);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch station" },
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
    const { stationName, stopOrder } = body;

    const station = await prisma.routeStation.update({
      where: { id: parseInt(id) },
      data: {
        ...(stationName && { stationName }),
        ...(stopOrder !== undefined && { stopOrder }),
      },
      include: { route: true },
    });

    return NextResponse.json(station);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update station" },
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
    await prisma.routeStation.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Station deleted successfully" });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete station with existing bookings" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}
