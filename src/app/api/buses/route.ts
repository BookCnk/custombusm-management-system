import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { busNumber: "asc" },
    });
    return NextResponse.json(buses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch buses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busNumber, totalSeats = 40 } = body;

    if (!busNumber) {
      return NextResponse.json(
        { error: "busNumber is required" },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        totalSeats,
      },
    });

    return NextResponse.json(bus, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Bus number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bus" },
      { status: 500 }
    );
  }
}
