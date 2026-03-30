import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
      orderBy: { routeName: "asc" },
    });
    return NextResponse.json(routes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { routeName, stations } = body;

    if (!routeName) {
      return NextResponse.json(
        { error: "routeName is required" },
        { status: 400 }
      );
    }

    const route = await prisma.route.create({
      data: {
        routeName,
        stations: stations?.length
          ? {
              create: stations.map((s: { stationName: string; stopOrder: number }, index: number) => ({
                stationName: s.stationName,
                stopOrder: s.stopOrder ?? index + 1,
              })),
            }
          : undefined,
      },
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
    });

    return NextResponse.json(route, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}
