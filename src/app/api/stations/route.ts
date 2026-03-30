import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");

    const stations = await prisma.routeStation.findMany({
      where: routeId ? { routeId: parseInt(routeId) } : undefined,
      include: { route: true },
      orderBy: [{ routeId: "asc" }, { stopOrder: "asc" }],
    });

    return NextResponse.json(stations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { routeId, stationName, stopOrder } = body;

    if (!routeId || !stationName || stopOrder === undefined) {
      return NextResponse.json(
        { error: "routeId, stationName, and stopOrder are required" },
        { status: 400 }
      );
    }

    const station = await prisma.routeStation.create({
      data: {
        routeId,
        stationName,
        stopOrder,
      },
      include: { route: true },
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
