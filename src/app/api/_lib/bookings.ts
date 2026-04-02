import { Prisma } from "@prisma/client";

import { bookingRouteValidationInclude } from "./includes";

export async function validateBookingStations(
  tx: Prisma.TransactionClient,
  scheduleId: number,
  pickupStationId: number,
  dropoffStationId: number,
) {
  const schedule = await tx.schedule.findUnique({
    where: { id: scheduleId },
    include: bookingRouteValidationInclude,
  });

  if (!schedule) {
    return { error: "Schedule not found", status: 404 } as const;
  }

  const pickupStation = schedule.route.stations.find(
    (station) => station.id === pickupStationId,
  );
  const dropoffStation = schedule.route.stations.find(
    (station) => station.id === dropoffStationId,
  );

  if (!pickupStation || !dropoffStation) {
    return {
      error: "Pickup and dropoff stations must belong to the schedule route",
      status: 400,
    } as const;
  }

  if (pickupStation.id === dropoffStation.id) {
    return {
      error: "Pickup and dropoff stations must be different",
      status: 400,
    } as const;
  }

  if (pickupStation.stopOrder >= dropoffStation.stopOrder) {
    return {
      error: "Pickup station must come before dropoff station",
      status: 400,
    } as const;
  }

  return { schedule } as const;
}
