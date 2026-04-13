import { Prisma } from "@prisma/client";

export const busDetailInclude = Prisma.validator<Prisma.BusInclude>()({
  schedules: {
    include: {
      route: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: [{ departureDate: "desc" }, { departureTime: "asc" }],
  },
  _count: {
    select: {
      schedules: true,
    },
  },
});

export const routeListInclude = Prisma.validator<Prisma.RouteInclude>()({
  stations: {
    where: { stopOrder: { gt: 0 } },
    orderBy: { stopOrder: "asc" },
  },
});

export const routeDetailInclude = Prisma.validator<Prisma.RouteInclude>()({
  stations: {
    where: { stopOrder: { gt: 0 } },
    orderBy: { stopOrder: "asc" },
  },
  schedules: {
    include: {
      bus: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: [{ departureDate: "desc" }, { departureTime: "asc" }],
  },
});

export const stationInclude = Prisma.validator<Prisma.RouteStationInclude>()({
  route: true,
});

export const scheduleListInclude = Prisma.validator<Prisma.ScheduleInclude>()({
  bus: true,
  route: {
    include: {
      stations: {
        where: { stopOrder: { gt: 0 } },
        orderBy: { stopOrder: "asc" },
      },
    },
  },
  bookings: {
    select: {
      seatNumber: true,
      status: true,
    },
    orderBy: {
      seatNumber: "asc",
    },
  },
  _count: {
    select: {
      bookings: true,
    },
  },
});

export const scheduleDetailInclude = Prisma.validator<Prisma.ScheduleInclude>()(
  {
    bus: true,
    route: {
      include: {
        stations: {
          where: { stopOrder: { gt: 0 } },
          orderBy: { stopOrder: "asc" },
        },
      },
    },
    bookings: {
      select: {
        id: true,
        seatNumber: true,
        price: true,
        pickupStationName: true,
        dropoffStationName: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    },
    _count: {
      select: {
        bookings: true,
      },
    },
  },
);

export const bookingInclude = Prisma.validator<Prisma.BookingInclude>()({
  schedule: {
    include: {
      bus: true,
      route: {
        include: {
          stations: {
            where: { stopOrder: { gt: 0 } },
            orderBy: { stopOrder: "asc" },
          },
        },
      },
    },
  },
});

export const bookingRouteValidationInclude =
  Prisma.validator<Prisma.ScheduleInclude>()({
    route: {
      include: {
        stations: {
          where: { stopOrder: { gt: 0 } },
          orderBy: { stopOrder: "asc" },
        },
      },
    },
  });
