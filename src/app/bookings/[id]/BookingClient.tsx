"use client";

import { useEffect, useState } from "react";
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
  price: number;
  pickupStationName: string;
  dropoffStationName: string;
  createdAt: string;
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
  let seatNumber = 1; // เริ่มนับจาก 1

  rows.push([
    ...Array(layout.seatsPerRow - 1)
      .fill(null)
      .map((_, i) => ({
        id: `aisle-top-${i}`,
        type: "aisle" as SeatType,
        label: "",
      })),
    { id: "driver", type: "driver", label: "คนขับ" },
  ]);

  for (let row = 1; row <= layout.totalRows; row++) {
    const rowSeats: Seat[] = [];

    for (let col = 1; col <= layout.seatsPerRow; col++) {
      if (col === layout.aisleAfter + 1) {
        rowSeats.push({ id: `aisle-${row}-${col}`, type: "aisle", label: "" });
        continue;
      }

      const seatLabel = seatNumber.toString();
      let type: SeatType = "available";

      if (bookedSeats.includes(seatLabel)) type = "booked";
      else if (selectedSeats.includes(seatLabel)) type = "selected";

      rowSeats.push({ id: `seat-${row}-${col}`, type, label: seatLabel });
      seatNumber++; // เพิ่มหมายเลขที่นั่ง
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
        continue;
      }

      const seatLabel = seatNumber.toString();
      let type: SeatType = "available";

      if (bookedSeats.includes(seatLabel)) type = "booked";
      else if (selectedSeats.includes(seatLabel)) type = "selected";

      backRow.push({ id: `seat-back-${i}`, type, label: seatLabel });
      seatNumber++; // เพิ่มหมายเลขที่นั่ง
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
      price: 0,
      pickupStationName: "",
      dropoffStationName: "",
      createdAt: new Date().toISOString(),
    }));
  const sortedStations = [...safeStations].sort(
    (a, b) => a.stopOrder - b.stopOrder,
  );

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [pickupStationName, setPickupStationName] = useState("");
  const [dropoffStationName, setDropoffStationName] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookedListModalOpen, setIsBookedListModalOpen] = useState(false);
  const [price, setPrice] = useState("0");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const bookedSeats = bookings.map((booking) => booking.seatNumber);
  const seatRows = generateSeats(layout, bookedSeats, selectedSeats);

  const canSubmitRoute =
    pickupStationName.trim() !== "" &&
    dropoffStationName.trim() !== "" &&
    pickupStationName.trim() !== dropoffStationName.trim();
  const canSubmitBooking =
    passengerName.trim() !== "" &&
    passengerPhone.trim() !== "" &&
    canSubmitRoute;
  const isBookingActionDisabled = !hasHydrated || selectedSeats.length === 0;
  const isSubmitDisabled =
    !hasHydrated ||
    selectedSeats.length === 0 ||
    !canSubmitBooking ||
    isSubmitting;

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
      alert("1 1 1 1 1 1");
      return;
    }

    const pickupId = sortedStations[0]?.id ?? 1;
    const dropoffId = sortedStations.at(-1)?.id ?? 2;

    if (!Number.isInteger(pickupId) || !Number.isInteger(dropoffId)) {
      alert("1 1 1 1 1 1");
      return;
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert("กรุณาระบุราคาเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
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
            pickupStationId: pickupId,
            dropoffStationId: dropoffId,
            pickupStationName: pickupStationName.trim(),
            dropoffStationName: dropoffStationName.trim(),
            price: parsedPrice,
            passengerName,
            passengerPhone,
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
      setPrice("0");
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
                disabled={isBookingActionDisabled}
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

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                รายละเอียดการจอง
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ดูรายการที่นั่งที่จองแล้ว พร้อมจุดขึ้น จุดลง
                และยกเลิกได้จากหน้านี้
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {bookings.length} รายการ
            </div>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500">
              ยังไม่มีรายการจองสำหรับเที่ยวรถนี้
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      ที่นั่ง
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      ราคา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      จุดรับ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      จุดส่ง
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      วันที่จอง
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-3">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ฿{booking.price.toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.pickupStationName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.dropoffStationName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={deletingBookingId === booking.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <Trash2 size={16} />
                          {deletingBookingId === booking.id
                            ? "กำลังลบ..."
                            : "ลบรายการ"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              จาก (จุดขึ้น)
            </label>
            <input
              type="text"
              value={pickupStationName}
              onChange={(e) => setPickupStationName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ใส่ชื่อจุดขึ้น"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ไป (จุดลง)
            </label>
            <input
              type="text"
              value={dropoffStationName}
              onChange={(e) => setDropoffStationName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ใส่ชื่อจุดลง"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ชื่อผู้โดยสาร
            </label>
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ใส่ชื่อผู้โดยสาร"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ใส่เบอร์โทรศัพท์"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ราคา
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
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
              disabled={isSubmitDisabled}
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
                    {booking.pickupStationName || "-"} ไป{" "}
                    {booking.dropoffStationName || "-"}
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
