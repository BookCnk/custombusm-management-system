export type BookingSnapshotRecord = {
  seatNumber?: string | null;
  status?: string | null;
};

export function buildBookingSnapshot(bookings: BookingSnapshotRecord[]) {
  return bookings
    .filter(
      (booking) =>
        booking.status === undefined ||
        booking.status === null ||
        booking.status === "CONFIRMED",
    )
    .map((booking) => booking.seatNumber?.trim().toUpperCase() ?? "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}
