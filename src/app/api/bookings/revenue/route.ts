import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { jsonError } from "../../_lib/http";
import { normalizeDateInput } from "../../_lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return jsonError("date is required", 400);
  }

  const parsedDate = normalizeDateInput(date);

  if (!parsedDate) {
    return jsonError("date must be a valid ISO date string", 400);
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        schedule: {
          departureDate: {
            gte: parsedDate,
            lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
      select: {
        price: true,
      },
    });

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.price,
      0,
    );

    return NextResponse.json({
      date,
      totalRevenue,
      totalBookings: bookings.length,
    });
  } catch {
    return jsonError("Failed to fetch revenue", 500);
  }
}
