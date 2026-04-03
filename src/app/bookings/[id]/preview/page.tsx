import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  Ticket,
  Clock,
  CalendarDays,
  LayoutGrid,
  CheckSquare,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { normalizeSeatLayout, type SeatLayout } from "@/lib/bus-management";
import BookingRealtimeShell from "../BookingRealtimeShell";
import { buildBookingSnapshot } from "../booking-realtime-shared";

interface BookingPreviewPageProps {
  params: Promise<{ id: string }>;
}

type SeatType = "available" | "booked" | "driver" | "door" | "aisle";

interface Seat {
  id: string;
  type: SeatType;
  label: string;
  passengerName?: string;
}

function generateDriverViewSeats(
  layout: SeatLayout,
  bookedSeats: Map<
    string,
    { passengerName: string | null; seatNumber: string }
  >,
): Seat[][] {
  const rows: Seat[][] = [];

  // Driver row
  rows.push([
    { id: "driver", type: "driver", label: "🚌" },
    { id: "door", type: "door", label: "🚪" },
    ...Array(layout.seatsPerRow - 2)
      .fill(null)
      .map((_, i) => ({
        id: `aisle-top-${i}`,
        type: "aisle" as SeatType,
        label: "",
      })),
  ]);

  // Seat rows
  for (let row = 1; row <= layout.totalRows; row++) {
    const rowSeats: Seat[] = [];
    for (let col = 1; col <= layout.seatsPerRow; col++) {
      if (col === layout.aisleAfter + 1) {
        rowSeats.push({ id: `aisle-${row}-${col}`, type: "aisle", label: "" });
      } else {
        const colLabel =
          col <= layout.aisleAfter
            ? String.fromCharCode(65 + col - 1)
            : String.fromCharCode(65 + col - 2);
        const seatLabel = `${colLabel}${row}`;
        const booking = bookedSeats.get(seatLabel);

        rowSeats.push({
          id: `seat-${row}-${col}`,
          type: booking ? "booked" : "available",
          label: seatLabel,
          passengerName: booking?.passengerName || undefined,
        });
      }
    }
    rows.push(rowSeats);
  }

  // Back row
  if (layout.hasBackRow && layout.backRowSeats > 0) {
    const backRow: Seat[] = [];
    for (let i = 0; i < layout.backRowSeats; i++) {
      if (
        i === Math.floor(layout.backRowSeats / 2) &&
        layout.backRowSeats >= 4
      ) {
        backRow.push({ id: "aisle-back", type: "aisle", label: "" });
      }
      const seatLabel = `${String.fromCharCode(65 + i)}${layout.totalRows + 1}`;
      const booking = bookedSeats.get(seatLabel);

      backRow.push({
        id: `seat-back-${i}`,
        type: booking ? "booked" : "available",
        label: seatLabel,
        passengerName: booking?.passengerName || undefined,
      });
    }
    rows.push(backRow);
  }

  return rows;
}

async function getScheduleData(scheduleId: string) {
  const id = parseInt(scheduleId, 10);
  if (isNaN(id) || id <= 0) return null;

  const schedule = await prisma.schedule.findUnique({
    where: { id },
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
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          pickupStation: true,
          dropoffStation: true,
        },
        orderBy: { seatNumber: "asc" },
      },
    },
  });

  if (!schedule) return null;

  return schedule;
}

export default async function BookingPreviewPage({
  params,
}: BookingPreviewPageProps) {
  const { id } = await params;
  const schedule = await getScheduleData(id);

  if (!schedule) {
    notFound();
  }

  const layout = normalizeSeatLayout(
    schedule.bus.layout,
    schedule.bus.totalSeats,
  );

  // Build booked seats map
  const bookedSeats = new Map<
    string,
    { passengerName: string | null; seatNumber: string }
  >();
  schedule.bookings.forEach((booking) => {
    bookedSeats.set(booking.seatNumber, {
      passengerName: booking.passengerName,
      seatNumber: booking.seatNumber,
    });
  });

  const seatRows = generateDriverViewSeats(layout, bookedSeats);
  const bookingSnapshot = buildBookingSnapshot(schedule.bookings);

  const availableSeats = schedule.bus.totalSeats - schedule.bookings.length;
  const occupancyRate =
    (schedule.bookings.length / schedule.bus.totalSeats) * 100;

  return (
    <BookingRealtimeShell
      scheduleId={schedule.id}
      initialSnapshot={bookingSnapshot}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Link
                href="/bookings"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
                <span>กลับ</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                ผังที่นั่ง - โหมดคนขับ
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <Link
                href={`/bookings/${id}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors hover:bg-white/50">
                <CheckSquare size={16} />
                จองที่นั่ง
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                <LayoutGrid size={16} />
                ผังที่นั่ง
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-amber-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Bus size={20} />
              <span className="font-semibold">{schedule.bus.busNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket size={20} />
              <span>{schedule.route.routeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={20} />
              <span>
                {new Date(schedule.departureDate).toLocaleDateString("th-TH")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{schedule.departureTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-3 gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-gray-500">จองแล้ว</p>
            <p className="text-2xl font-bold text-red-600">
              {schedule.bookings.length}
            </p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-sm text-gray-500">ว่าง</p>
            <p className="text-2xl font-bold text-green-600">
              {availableSeats}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">อัตราการจอง</p>
            <p className="text-2xl font-bold text-blue-600">
              {occupancyRate.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Seat Map - Read Only */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ผังที่นั่ง
          </h2>

          <div className="flex flex-col items-center gap-2">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((seat) => {
                  const getSeatStyle = (type: SeatType) => {
                    switch (type) {
                      case "driver":
                        return "w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg";
                      case "door":
                        return "w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-lg";
                      case "aisle":
                        return "w-10 h-12";
                      case "booked":
                        return "w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-default";
                      default:
                        return "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-default";
                    }
                  };

                  return (
                    <div
                      key={seat.id}
                      className={getSeatStyle(seat.type)}
                      title={seat.passengerName || undefined}>
                      {seat.type !== "aisle" && seat.label}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-500" />
              <span className="text-gray-600">ว่าง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-400" />
              <span className="text-gray-600">จองแล้ว</span>
            </div>
          </div>
        </div>

        {/* Booking List */}
        {schedule.bookings.length > 0 && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              รายชื่อผู้โดยสาร ({schedule.bookings.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      ที่นั่ง
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      ชื่อผู้โดยสาร
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      จุดรับ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      จุดส่ง
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedule.bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-600">
                          {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.passengerName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.pickupStation?.stationName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.dropoffStation?.stationName || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </BookingRealtimeShell>
  );
}
