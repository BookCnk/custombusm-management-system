"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

import { type SeatLayout } from "@/lib/bus-management";

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

interface BookingClientProps {
  scheduleId: string;
  layout: SeatLayout;
  stations: RouteStation[];
  bookedSeats: string[];
}

function generateSeats(
  layout: SeatLayout,
  bookedSeats: string[],
  selectedSeats: string[],
): Seat[][] {
  const rows: Seat[][] = [];

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
        let type: SeatType = "available";
        if (bookedSeats.includes(seatLabel)) type = "booked";
        else if (selectedSeats.includes(seatLabel)) type = "selected";
        rowSeats.push({ id: `seat-${row}-${col}`, type, label: seatLabel });
      }
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

export default function BookingClient({
  scheduleId,
  layout,
  stations,
  bookedSeats: initialBookedSeats,
}: BookingClientProps) {
  const [seatRows, setSeatRows] = useState<Seat[][]>(() =>
    generateSeats(layout, initialBookedSeats, []),
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>(initialBookedSeats);
  const [formData, setFormData] = useState({
    passengerName: "",
    passengerPhone: "",
    pickupStationId: "",
    dropoffStationId: "",
    price: "",
  });

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
      ? selectedSeats.filter((s) => s !== seat.label)
      : [...selectedSeats, seat.label];

    setSelectedSeats(newSelected);
    setSeatRows(generateSeats(layout, initialBookedSeats, newSelected));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      alert("กรุณาเลือกที่นั่ง");
      return;
    }
    if (!formData.passengerName || !formData.passengerPhone) {
      alert("กรุณากรอกข้อมูลผู้โดยสาร");
      return;
    }
    if (!formData.pickupStationId || !formData.dropoffStationId) {
      alert("กรุณาเลือกจุดรับ-ส่ง");
      return;
    }

    try {
      for (const seatNumber of selectedSeats) {
        await apiRequest("/api/bookings", {
          method: "POST",
          body: JSON.stringify({
            scheduleId: parseInt(scheduleId),
            seatNumber,
            passengerName: formData.passengerName,
            passengerPhone: formData.passengerPhone,
            pickupStationId: parseInt(formData.pickupStationId),
            dropoffStationId: parseInt(formData.dropoffStationId),
            price: parseFloat(formData.price) || 0,
          }),
        });
      }

      alert("จองตั๋วสำเร็จ");
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "จองตั๋วไม่สำเร็จ";
      alert(message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              เลือกที่นั่ง
            </h2>
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
                              ? "bg-red-100 text-red-700 cursor-not-allowed"
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

            {/* Legend */}
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

        {/* Booking Form */}
        <div>
          <form
            onSubmit={handleSubmitBooking}
            className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              ข้อมูลการจอง
            </h2>

            <div className="mb-4">
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

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ชื่อผู้โดยสาร
              </label>
              <input
                type="text"
                value={formData.passengerName}
                onChange={(e) =>
                  setFormData({ ...formData, passengerName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={formData.passengerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, passengerPhone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="เบอร์โทร"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                จุดรับ
              </label>
              <select
                value={formData.pickupStationId}
                onChange={(e) =>
                  setFormData({ ...formData, pickupStationId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required>
                <option value="">เลือกจุดรับ</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.stationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                จุดส่ง
              </label>
              <select
                value={formData.dropoffStationId}
                onChange={(e) =>
                  setFormData({ ...formData, dropoffStationId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                required>
                <option value="">เลือกจุดส่ง</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.stationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ราคา (บาท)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <button
              type="submit"
              disabled={selectedSeats.length === 0}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              จองที่นั่ง ({selectedSeats.length})
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
