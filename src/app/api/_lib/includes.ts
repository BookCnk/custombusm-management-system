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
    orderBy: { stopOrder: "asc" },
  },
});

export const routeDetailInclude = Prisma.validator<Prisma.RouteInclude>()({
  stations: {
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

export const scheduleDetailInclude =
  Prisma.validator<Prisma.ScheduleInclude>()({
    bus: true,
    route: {
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
    },
    bookings: {
      include: {
        pickupStation: true,
        dropoffStation: true,
      },
      orderBy: { createdAt: "desc" },
    },
    _count: {
      select: {
        bookings: true,
      },
    },
  });

export const bookingInclude = Prisma.validator<Prisma.BookingInclude>()({
  schedule: {
    include: {
      bus: true,
      route: {
        include: {
          stations: {
            orderBy: { stopOrder: "asc" },
          },
        },
      },
    },
  },
  pickupStation: true,
  dropoffStation: true,
});

export const bookingRouteValidationInclude =
  Prisma.validator<Prisma.ScheduleInclude>()({
    route: {
      include: {
        stations: {
          orderBy: { stopOrder: "asc" },
        },
      },
    },
  });
