import {
  routeListInclude,
  scheduleListInclude,
  stationInclude,
} from "@/app/api/_lib/includes";
import { prisma } from "@/lib/prisma";
import {
  mapBus,
  mapRoute,
  mapRouteStation,
  mapSchedule,
  type BusData,
  type RouteData,
  type RouteStationData,
  type ScheduleData,
} from "@/lib/bus-management";

export type StationRow = RouteStationData & { routeName: string };

function buildStationRow(item: unknown): StationRow {
  const station = mapRouteStation(item);
  const route =
    typeof item === "object" && item !== null && "route" in item
      ? mapRoute((item as { route?: unknown }).route)
      : undefined;

  return {
    ...station,
    routeName: route?.routeName ?? "",
  };
}

function getDateRange(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.valueOf())) {
    throw new Error(`Invalid date input: ${date}`);
  }

  return {
    gte: parsedDate,
    lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000),
  };
}

export function getCurrentDateInputValue() {
  // Use ICT (UTC+7) timezone
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ictTime = new Date(utc + 7 * 3600000); // UTC+7
  const year = ictTime.getFullYear();
  const month = String(ictTime.getMonth() + 1).padStart(2, "0");
  const day = String(ictTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getInitialBuses() {
  const buses = await prisma.bus.findMany({
    include: {
      _count: {
        select: {
          schedules: true,
        },
      },
    },
    orderBy: { busNumber: "asc" },
  });

  return buses.map((item) => mapBus(item)) satisfies BusData[];
}

export async function getInitialRoutes(query = "") {
  const q = query.trim();
  const routes = await prisma.route.findMany({
    where: q
      ? {
          routeName: {
            contains: q,
            mode: "insensitive",
          },
        }
      : undefined,
    include: routeListInclude,
    orderBy: { routeName: "asc" },
  });

  return routes.map((item) => mapRoute(item)) satisfies RouteData[];
}

export async function getInitialStations(query = "") {
  const q = query.trim();
  const [routes, stations] = await Promise.all([
    prisma.route.findMany({
      include: routeListInclude,
      orderBy: { routeName: "asc" },
    }),
    prisma.routeStation.findMany({
      where: {
        stopOrder: { gt: 0 },
        ...(q && {
          OR: [
            {
              stationName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              route: {
                routeName: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
      },
      include: stationInclude,
      orderBy: [{ routeId: "asc" }, { stopOrder: "asc" }],
    }),
  ]);

  return {
    routes: routes.map((item) => mapRoute(item)) satisfies RouteData[],
    stations: stations.map((item) =>
      buildStationRow(item),
    ) satisfies StationRow[],
  };
}

export async function getInitialSchedules(date: string) {
  const schedules = await prisma.schedule.findMany({
    where: {
      departureDate: getDateRange(date),
    },
    include: scheduleListInclude,
    orderBy: [{ departureDate: "desc" }, { departureTime: "asc" }],
  });

  return schedules.map((item) => mapSchedule(item)) satisfies ScheduleData[];
}

export async function getInitialSchedulesPageData(date: string) {
  const [buses, routes, schedules] = await Promise.all([
    prisma.bus.findMany({
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: { busNumber: "asc" },
    }),
    prisma.route.findMany({
      include: routeListInclude,
      orderBy: { routeName: "asc" },
    }),
    prisma.schedule.findMany({
      where: {
        departureDate: getDateRange(date),
      },
      include: scheduleListInclude,
      orderBy: [{ departureDate: "desc" }, { departureTime: "asc" }],
    }),
  ]);

  return {
    buses: buses.map((item) => mapBus(item)) satisfies BusData[],
    routes: routes.map((item) => mapRoute(item)) satisfies RouteData[],
    schedules: schedules.map((item) =>
      mapSchedule(item),
    ) satisfies ScheduleData[],
  };
}
