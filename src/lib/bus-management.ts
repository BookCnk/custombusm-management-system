export interface SeatLayout {
  totalRows: number;
  seatsPerRow: number;
  aisleAfter: number;
  totalSeats: number;
  hasBackRow: boolean;
  backRowSeats: number;
  customSeatLabels?: Record<string, string>;
}

export interface BusData {
  id: number;
  busNumber: string;
  totalSeats: number;
  type: string;
  status: "active" | "maintenance";
  layout: SeatLayout;
}

export interface RouteStationData {
  id: number;
  routeId: number;
  stationName: string;
  stopOrder: number;
}

export interface RouteData {
  id: number;
  routeName: string;
  stations: RouteStationData[];
}

export interface BookingData {
  id: number;
  scheduleId: number;
  seatNumber: string;
  passengerName: string | null;
  passengerPhone: string | null;
  pickupStationId: number;
  dropoffStationId: number;
  price: number;
  status: "CONFIRMED" | "CANCELLED";
  createdAt?: string;
  pickupStation?: RouteStationData;
  dropoffStation?: RouteStationData;
}

export interface ScheduleData {
  id: number;
  busId: number;
  routeId: number;
  departureDate: string;
  departureTime: string;
  bus: BusData;
  route: RouteData;
  bookings: Array<Pick<BookingData, "seatNumber" | "status">>;
  bookingsCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asStringRecord(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function createDefaultSeatLayout(totalSeats = 40): SeatLayout {
  if (totalSeats <= 32) {
    return {
      totalRows: 8,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats,
      hasBackRow: false,
      backRowSeats: 0,
    };
  }

  const extraSeats = Math.max(totalSeats - 40, 0);

  return {
    totalRows: 10,
    seatsPerRow: 4,
    aisleAfter: 2,
    totalSeats,
    hasBackRow: extraSeats > 0,
    backRowSeats: extraSeats,
  };
}

export function normalizeSeatLayout(layout: unknown, totalSeats = 40): SeatLayout {
  if (!isRecord(layout)) {
    return createDefaultSeatLayout(totalSeats);
  }

  const fallback = createDefaultSeatLayout(totalSeats);

  return {
    totalRows: asNumber(layout.totalRows, fallback.totalRows),
    seatsPerRow: asNumber(layout.seatsPerRow, fallback.seatsPerRow),
    aisleAfter: asNumber(layout.aisleAfter, fallback.aisleAfter),
    totalSeats: asNumber(layout.totalSeats, totalSeats),
    hasBackRow: asBoolean(layout.hasBackRow, fallback.hasBackRow),
    backRowSeats: asNumber(layout.backRowSeats, fallback.backRowSeats),
    customSeatLabels: asStringRecord(layout.customSeatLabels),
  };
}

export function toDateInputValue(value: string) {
  return value.includes("T") ? value.split("T")[0] : value;
}

export function mapRouteStation(raw: unknown): RouteStationData {
  const station = isRecord(raw) ? raw : {};

  return {
    id: asNumber(station.id, 0),
    routeId: asNumber(station.routeId, 0),
    stationName: asString(station.stationName, ""),
    stopOrder: asNumber(station.stopOrder, 0),
  };
}

export function mapRoute(raw: unknown): RouteData {
  const route = isRecord(raw) ? raw : {};
  const stations = Array.isArray(route.stations) ? route.stations : [];

  return {
    id: asNumber(route.id, 0),
    routeName: asString(route.routeName, ""),
    stations: stations.map((station) => mapRouteStation(station)),
  };
}

export function mapBus(raw: unknown): BusData {
  const bus = isRecord(raw) ? raw : {};
  const totalSeats = asNumber(bus.totalSeats, 40);

  return {
    id: asNumber(bus.id, 0),
    busNumber: asString(bus.busNumber, ""),
    totalSeats,
    type: asString(bus.type, "มาตรฐาน"),
    status:
      bus.status === "maintenance" ? "maintenance" : "active",
    layout: normalizeSeatLayout(bus.layout, totalSeats),
  };
}

export function mapBooking(raw: unknown): BookingData {
  const booking = isRecord(raw) ? raw : {};

  return {
    id: asNumber(booking.id, 0),
    scheduleId: asNumber(booking.scheduleId, 0),
    seatNumber: asString(booking.seatNumber, ""),
    passengerName:
      typeof booking.passengerName === "string" ? booking.passengerName : null,
    passengerPhone:
      typeof booking.passengerPhone === "string" ? booking.passengerPhone : null,
    pickupStationId: asNumber(booking.pickupStationId, 0),
    dropoffStationId: asNumber(booking.dropoffStationId, 0),
    price: asNumber(booking.price, 0),
    status: booking.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
    createdAt:
      typeof booking.createdAt === "string" ? booking.createdAt : undefined,
    pickupStation: booking.pickupStation
      ? mapRouteStation(booking.pickupStation)
      : undefined,
    dropoffStation: booking.dropoffStation
      ? mapRouteStation(booking.dropoffStation)
      : undefined,
  };
}

export function mapSchedule(raw: unknown): ScheduleData {
  const schedule = isRecord(raw) ? raw : {};
  const bookings = Array.isArray(schedule.bookings) ? schedule.bookings : [];
  const countRecord = isRecord(schedule._count) ? schedule._count : {};

  return {
    id: asNumber(schedule.id, 0),
    busId: asNumber(schedule.busId, 0),
    routeId: asNumber(schedule.routeId, 0),
    departureDate: toDateInputValue(asString(schedule.departureDate, "")),
    departureTime: asString(schedule.departureTime, ""),
    bus: mapBus(schedule.bus),
    route: mapRoute(schedule.route),
    bookings: bookings.map((booking) => {
      const item = isRecord(booking) ? booking : {};
      return {
        seatNumber: asString(item.seatNumber, ""),
        status: item.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
      };
    }),
    bookingsCount: asNumber(
      countRecord.bookings,
      bookings.filter((booking) => {
        const item = isRecord(booking) ? booking : {};
        return item.status !== "CANCELLED";
      }).length,
    ),
  };
}

export function buildBookedSeatsMap(schedules: ScheduleData[]) {
  return Object.fromEntries(
    schedules.map((schedule) => [
      schedule.id,
      schedule.bookings
        .filter((booking) => booking.status === "CONFIRMED")
        .map((booking) => booking.seatNumber),
    ]),
  ) as Record<number, string[]>;
}
