import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { jsonError, parseOptionalPositiveInt } from "../../_lib/http";
import { normalizeDateInput } from "../../_lib/validation";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function parseMonthInput(value: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

function startOfTodayUtc() {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function getDailyRevenueRange(startDate: Date, endDate: Date) {
  const endExclusive = new Date(endDate.getTime() + DAY_IN_MS);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      schedule: {
        departureDate: {
          gte: startDate,
          lt: endExclusive,
        },
      },
    },
    select: {
      price: true,
      schedule: {
        select: {
          departureDate: true,
        },
      },
    },
    orderBy: {
      schedule: {
        departureDate: "asc",
      },
    },
  });

  const dailyMap = new Map<string, { revenue: number; bookings: number }>();

  for (
    let current = new Date(startDate);
    current <= endDate;
    current = new Date(current.getTime() + DAY_IN_MS)
  ) {
    dailyMap.set(formatDateKey(current), { revenue: 0, bookings: 0 });
  }

  for (const booking of bookings) {
    const key = formatDateKey(booking.schedule.departureDate);
    const current = dailyMap.get(key);

    if (!current) {
      continue;
    }

    current.revenue += booking.price;
    current.bookings += 1;
  }

  const daily = Array.from(dailyMap.entries()).map(([date, value]) => ({
    date,
    revenue: value.revenue,
    bookings: value.bookings,
  }));

  const totalRevenue = daily.reduce((sum, day) => sum + day.revenue, 0);
  const totalBookings = daily.reduce((sum, day) => sum + day.bookings, 0);

  return {
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(endDate),
    totalRevenue,
    totalBookings,
    daily,
  };
}

async function getMonthlyRevenueSummary(endMonth: Date, months: number) {
  const rangeStart = new Date(
    Date.UTC(endMonth.getUTCFullYear(), endMonth.getUTCMonth() - (months - 1), 1),
  );
  const rangeEndExclusive = new Date(
    Date.UTC(endMonth.getUTCFullYear(), endMonth.getUTCMonth() + 1, 1),
  );

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      schedule: {
        departureDate: {
          gte: rangeStart,
          lt: rangeEndExclusive,
        },
      },
    },
    select: {
      price: true,
      schedule: {
        select: {
          departureDate: true,
        },
      },
    },
  });

  const monthlyMap = new Map<string, { revenue: number; bookings: number }>();

  for (let index = 0; index < months; index += 1) {
    const currentMonth = new Date(
      Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth() + index, 1),
    );
    monthlyMap.set(formatMonthKey(currentMonth), { revenue: 0, bookings: 0 });
  }

  for (const booking of bookings) {
    const key = formatMonthKey(booking.schedule.departureDate);
    const current = monthlyMap.get(key);

    if (!current) {
      continue;
    }

    current.revenue += booking.price;
    current.bookings += 1;
  }

  const monthly = Array.from(monthlyMap.entries()).map(([month, value]) => ({
    month,
    revenue: value.revenue,
    bookings: value.bookings,
  }));

  const totalRevenue = monthly.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = monthly.reduce((sum, item) => sum + item.bookings, 0);

  return {
    endMonth: formatMonthKey(endMonth),
    months,
    totalRevenue,
    totalBookings,
    monthly,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupBy = searchParams.get("groupBy");
  const date = searchParams.get("date");
  const startDateInput = searchParams.get("startDate");
  const endDateInput = searchParams.get("endDate");
  const endMonthInput = searchParams.get("endMonth");
  const months = parseOptionalPositiveInt(searchParams.get("months")) ?? 6;

  if (groupBy === "month") {
    if (months > 24) {
      return jsonError("months must be between 1 and 24", 400);
    }

    const endMonth = endMonthInput ? parseMonthInput(endMonthInput) : startOfTodayUtc();

    if (!endMonth) {
      return jsonError("endMonth must be in YYYY-MM format", 400);
    }

    try {
      return NextResponse.json(await getMonthlyRevenueSummary(endMonth, months));
    } catch {
      return jsonError("Failed to fetch monthly revenue summary", 500);
    }
  }

  if (startDateInput || endDateInput) {
    const startDate = normalizeDateInput(startDateInput);
    const endDate = normalizeDateInput(endDateInput);

    if (!startDate || !endDate) {
      return jsonError("startDate and endDate must be valid ISO date strings", 400);
    }

    if (startDate > endDate) {
      return jsonError("startDate must be before or equal to endDate", 400);
    }

    try {
      return NextResponse.json(await getDailyRevenueRange(startDate, endDate));
    } catch {
      return jsonError("Failed to fetch revenue range", 500);
    }
  }

  if (!date) {
    return jsonError("date is required", 400);
  }

  const parsedDate = normalizeDateInput(date);

  if (!parsedDate) {
    return jsonError("date must be a valid ISO date string", 400);
  }

  try {
    const result = await getDailyRevenueRange(parsedDate, parsedDate);
    return NextResponse.json({
      date,
      totalRevenue: result.totalRevenue,
      totalBookings: result.totalBookings,
    });
  } catch {
    return jsonError("Failed to fetch revenue", 500);
  }
}
