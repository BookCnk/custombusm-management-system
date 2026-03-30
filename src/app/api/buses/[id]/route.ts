import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bus = await prisma.bus.findUnique({
      where: { id: parseInt(id) },
      include: {
        schedules: {
          orderBy: { departureDate: "desc" },
        },
      },
    });

    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json(bus);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bus" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { busNumber, totalSeats } = body;

    const bus = await prisma.bus.update({
      where: { id: parseInt(id) },
      data: {
        ...(busNumber && { busNumber }),
        ...(totalSeats !== undefined && { totalSeats }),
      },
    });

    return NextResponse.json(bus);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Bus number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update bus" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.bus.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Bus deleted successfully" });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete bus with existing schedules" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete bus" },
      { status: 500 },
    );
  }
}
