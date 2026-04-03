"use client";

import { useState } from "react";
import { CheckCircle, List, Trash2, X } from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { type SeatLayout } from "@/lib/bus-management";

import { announceScheduleBookingChange } from "./BookingRealtimeShell";

type SeatType =
  | "available"
  | "booked"
  | "selected"
  | "driver"
  | "door"
  | "aisle";

interface Seat {
  id: string;
  type: SeatType;
  label: string;
}

interface RouteStation {
  id: number;
  stationName: string;
  stopOrder: number;
}

interface BookingItem {
  id: number;
  seatNumber: string;
  pickupStation: {
    stationName: string;
  } | null;
  dropoffStation: {
    stationName: string;
  } | null;
}

interface BookingClientProps {
  scheduleId: string;
  layout: SeatLayout;
  stations?: RouteStation[];
  bookings?: BookingItem[];
  bookedSeats?: string[];
}

function generateSeats(
  layout: SeatLayout,
  bookedSeats: string[],
  selectedSeats: string[],
): Seat[][] {
  const rows: Seat[][] = [];

  rows.push([
    { id: "driver", type: "driver", label: "BUS" },
    { id: "door", type: "door", label: "DOOR" },
    ...Array(layout.seatsPerRow - 2)
      .fill(null)
      .map((_, i) => ({
        id: `aisle-top-${i}`,
        type: "aisle" as SeatType,
        label: "",
      })),
  ]);

  for (let row = 1; row <= layout.totalRows; row++) {
    const rowSeats: Seat[] = [];

    for (let col = 1; col <= layout.seatsPerRow; col++) {
      if (col === layout.aisleAfter + 1) {
        rowSeats.push({ id: `aisle-${row}-${col}`, type: "aisle", label: "" });
        continue;
      }

      const colLabel =
        col <= layout.aisleAfter
          ? String.fromCharCode(65 + col - 1)
          : String.fromCharCode(65 + col - 2);
      const seatLabel = `${colLabel}${row}`;
      let type: SeatType = "available";

      if (bookedSeats.includes(seatLabel)) type = "booked";
      else if (selectedSeats.includes(seatLabel)) type = "selected";

      rowSeats.push({ id: `seat-${row}-${col}`, type, label: seatLabel });
    }

    rows.push(rowSeats);
  }

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
      let type: SeatType = "available";

      if (bookedSeats.includes(seatLabel)) type = "booked";
      else if (selectedSeats.includes(seatLabel)) type = "selected";

      backRow.push({ id: `seat-back-${i}`, type, label: seatLabel });
    }

    rows.push(backRow);
  }

  return rows;
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BookingClient({
  scheduleId,
  layout,
  stations,
  bookings: initialBookingItems,
  bookedSeats: legacyBookedSeats,
}: BookingClientProps) {
  const safeStations = stations ?? [];
  const initialBookings =
    initialBookingItems ??
    (legacyBookedSeats ?? []).map((seatNumber, index) => ({
      id: -(index + 1),
      seatNumber,
      pickupStation: null,
      dropoffStation: null,
    }));
  const sortedStations = [...safeStations].sort(
    (a, b) => a.stopOrder - b.stopOrder,
  );

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [pickupStationId, setPickupStationId] = useState(
    sortedStations[0]?.id.toString() ?? "",
  );
  const [dropoffStationId, setDropoffStationId] = useState(
    sortedStations[1]?.id.toString() ??
      sortedStations.at(-1)?.id.toString() ??
      "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookedListModalOpen, setIsBookedListModalOpen] = useState(false);

  const bookedSeats = bookings.map((booking) => booking.seatNumber);
  const seatRows = generateSeats(layout, bookedSeats, selectedSeats);

  const canSubmitRoute =
    pickupStationId !== "" &&
    dropoffStationId !== "" &&
    pickupStationId !== dropoffStationId;

  const handleSeatClick = (seat: Seat) => {
    if (
      seat.type === "booked" ||
      seat.type === "driver" ||
      seat.type === "door" ||
      seat.type === "aisle"
    ) {
      return;
    }

    const newSelected = selectedSeats.includes(seat.label)
      ? selectedSeats.filter((currentSeat) => currentSeat !== seat.label)
      : [...selectedSeats, seat.label];

    setSelectedSeats(newSelected);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      alert("กรุณาเลือกที่นั่ง");
      return;
    }

    if (!canSubmitRoute) {
      alert("กรุณาเลือกจุดขึ้นและจุดลงให้ต่างกัน");
      return;
    }

    const pickupId = Number(pickupStationId);
    const dropoffId = Number(dropoffStationId);

    if (!Number.isInteger(pickupId) || !Number.isInteger(dropoffId)) {
      alert("ข้อมูลจุดขึ้นและจุดลงไม่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdBookings: BookingItem[] = [];

      for (const seatNumber of selectedSeats) {
        const booking = await apiRequest<BookingItem>("/api/bookings", {
          method: "POST",
          body: JSON.stringify({
            scheduleId: parseInt(scheduleId, 10),
            seatNumber,
            passengerName: null,
            passengerPhone: null,
            pickupStationId: pickupId,
            dropoffStationId: dropoffId,
            price: 0,
          }),
        });

        createdBookings.push(booking);
      }

      setBookings((current) =>
        [...current, ...createdBookings].sort((a, b) =>
          a.seatNumber.localeCompare(b.seatNumber),
        ),
      );
      setSelectedSeats([]);
      setIsBookingModalOpen(false);
      announceScheduleBookingChange(Number(scheduleId));
      alert("จองตั๋วสำเร็จ");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "จองตั๋วไม่สำเร็จ";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    setDeletingBookingId(bookingId);

    try {
      await apiRequest<{ message: string }>(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      setBookings((current) =>
        current.filter((booking) => booking.id !== bookingId),
      );
      announceScheduleBookingChange(Number(scheduleId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบการจองไม่สำเร็จ";
      alert(message);
    } finally {
      setDeletingBookingId(null);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                เลือกที่นั่ง
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                เลือกที่นั่งแล้วค่อยยืนยันใน modal
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsBookedListModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <List size={18} />
                รายการจองแล้ว ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                disabled={selectedSeats.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                <CheckCircle size={18} />
                จองที่นั่ง ({selectedSeats.length})
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {seatRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={
                      seat.type === "booked" ||
                      seat.type === "driver" ||
                      seat.type === "door" ||
                      seat.type === "aisle"
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      seat.type === "available"
                        ? "bg-gray-100 text-gray-700 hover:bg-blue-100"
                        : seat.type === "selected"
                          ? "bg-blue-600 text-white"
                          : seat.type === "booked"
                            ? "cursor-not-allowed bg-red-100 text-red-700"
                            : seat.type === "driver"
                              ? "bg-gray-200 text-gray-500"
                              : seat.type === "door"
                                ? "bg-gray-200 text-gray-500"
                                : "w-4"
                    }`}>
                    {seat.type !== "aisle" && seat.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-100" />
              <span className="text-gray-600">ว่าง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-600" />
              <span className="text-gray-600">เลือก</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-100" />
              <span className="text-gray-600">จองแล้ว</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="ยืนยันการจอง">
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ที่นั่งที่เลือก
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.length > 0 ? (
                selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    <CheckCircle size={14} />
                    {seat}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  ยังไม่ได้เลือกที่นั่ง
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              จาก
            </label>
            <select
              value={pickupStationId}
              onChange={(e) => setPickupStationId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required>
              <option value="">เลือกจุดขึ้น</option>
              {sortedStations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.stationName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ไป
            </label>
            <select
              value={dropoffStationId}
              onChange={(e) => setDropoffStationId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required>
              <option value="">เลือกจุดลง</option>
              {sortedStations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.stationName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50">
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={
                selectedSeats.length === 0 || !canSubmitRoute || isSubmitting
              }
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
              {isSubmitting ? "กำลังจอง..." : `จอง (${selectedSeats.length})`}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBookedListModalOpen}
        onClose={() => setIsBookedListModalOpen(false)}
        title={`รายการจองแล้ว (${bookings.length})`}>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">ยังไม่มีรายการจอง</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="font-medium text-gray-900">
                    ที่นั่ง {booking.seatNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.pickupStation?.stationName || "-"} ไป{" "}
                    {booking.dropoffStation?.stationName || "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(booking.id)}
                  disabled={deletingBookingId === booking.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <Trash2 size={16} />
                  {deletingBookingId === booking.id ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
