import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const route = await prisma.route.findUnique({
      where: { id: parseInt(id) },
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
        schedules: {
          orderBy: { departureDate: "desc" },
        },
      },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch route" },
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
    const { routeName } = body;

    const route = await prisma.route.update({
      where: { id: parseInt(id) },
      data: {
        ...(routeName && { routeName }),
      },
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
    });

    return NextResponse.json(route);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update route" },
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
    await prisma.route.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Route deleted successfully" });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete route with existing schedules" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
