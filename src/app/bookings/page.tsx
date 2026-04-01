"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  Bus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPinned,
  Users,
  ArrowLeft,
  CheckCircle,
  X,
  Phone,
  MapPin,
  CreditCard,
  Eye,
} from "lucide-react";

// Types
interface SeatLayout {
  totalRows: number;
  seatsPerRow: number;
  aisleAfter: number;
  totalSeats: number;
  hasBackRow: boolean;
  backRowSeats: number;
}

interface BusData {
  id: number;
  busNumber: string;
  totalSeats: number;
  type: string;
  layout: SeatLayout;
}

interface Schedule {
  id: number;
  busId: number;
  bus: BusData;
  route: { routeName: string };
  departureDate: string;
  departureTime: string;
  bookingsCount: number;
}

// Mock Data
const mockBuses: BusData[] = [
  {
    id: 1,
    busNumber: "815-1",
    totalSeats: 40,
    type: "มาตรฐาน",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 2,
    busNumber: "815-2",
    totalSeats: 40,
    type: "มาตรฐาน",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 3,
    busNumber: "VIP-01",
    totalSeats: 32,
    type: "VIP",
    layout: {
      totalRows: 8,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 32,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 4,
    busNumber: "VIP-02",
    totalSeats: 32,
    type: "VIP",
    layout: {
      totalRows: 8,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 32,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
];

const mockSchedules: Schedule[] = [
  {
    id: 1,
    busId: 1,
    bus: mockBuses[0],
    route: { routeName: "ราชสีมา - ระยอง" },
    departureDate: "2026-03-31",
    departureTime: "08:30",
    bookingsCount: 12,
  },
  {
    id: 2,
    busId: 2,
    bus: mockBuses[1],
    route: { routeName: "โคราช - กรุงเทพ" },
    departureDate: "2026-03-31",
    departureTime: "10:00",
    bookingsCount: 25,
  },
  {
    id: 3,
    busId: 3,
    bus: mockBuses[2],
    route: { routeName: "ราชสีมา - ระยอง" },
    departureDate: "2026-03-31",
    departureTime: "14:30",
    bookingsCount: 8,
  },
  {
    id: 4,
    busId: 4,
    bus: mockBuses[3],
    route: { routeName: "โคราช - กรุงเทพ" },
    departureDate: "2026-03-31",
    departureTime: "16:00",
    bookingsCount: 20,
  },
];

// Generate seat layout with booking status
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

const generateSeats = (
  layout: SeatLayout,
  bookedSeats: string[],
  selectedSeats: string[],
): Seat[][] => {
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

  // Regular seats
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

  // Back row
  if (layout.hasBackRow && layout.backRowSeats > 0) {
    const backRow: Seat[] = [];
    for (let i = 0; i < layout.backRowSeats; i++) {
      if (
        i === Math.floor(layout.backRowSeats / 2) &&
        layout.backRowSeats >= 4
      ) {
        backRow.push({ id: `aisle-back`, type: "aisle", label: "" });
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
};

// Seat Layout Component for Booking
function SeatLayout({
  layout,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  readOnly = false,
}: {
  layout: SeatLayout;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatClick: (seatLabel: string) => void;
  readOnly?: boolean;
}) {
  const seats = generateSeats(layout, bookedSeats, selectedSeats);

  const getSeatStyle = (type: SeatType) => {
    if (readOnly) {
      // Read-only mode: no selection possible, only show available vs booked
      switch (type) {
        case "driver":
          return "w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg";
        case "door":
          return "w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-lg";
        case "aisle":
          return "w-10 h-12";
        case "booked":
          return "w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-default";
        case "selected":
          return "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-default";
        case "available":
          return "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-default";
        default:
          return "";
      }
    }

    switch (type) {
      case "driver":
        return "w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg";
      case "door":
        return "w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-lg";
      case "aisle":
        return "w-10 h-12";
      case "booked":
        return "w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-not-allowed";
      case "selected":
        return "w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer shadow-lg shadow-green-200 hover:bg-green-600 transition-all transform scale-105";
      case "available":
        return "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-blue-600 transition-colors shadow-sm";
      default:
        return "";
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
      <div className="min-w-[320px] max-w-[600px] mx-auto">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-6 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg" />
            <span>{readOnly ? "ว่าง" : "ว่าง (คลิกเลือก)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-400 rounded-lg" />
            <span>จองแล้ว</span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg shadow-lg shadow-green-200" />
              <span>เลือก</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg" />
            <span>คนขับ</span>
          </div>
          {readOnly && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
              <Eye size={14} />
              โหมดดูผังที่นั่งเท่านั้น
            </div>
          )}
        </div>

        {/* Seats Grid */}
        <div className="space-y-2">
          {seats.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-1.5">
              {row.map((seat, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() =>
                    !readOnly &&
                    (seat.type === "available" || seat.type === "selected")
                      ? onSeatClick(seat.label)
                      : undefined
                  }
                  className={getSeatStyle(seat.type)}
                  title={
                    seat.type === "available" ||
                    seat.type === "selected" ||
                    seat.type === "booked"
                      ? `ที่นั่ง ${seat.label}`
                      : ""
                  }>
                  {seat.type !== "aisle" && seat.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Booking Modal
function BookingModal({
  isOpen,
  onClose,
  schedule,
  selectedSeats,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  selectedSeats: string[];
  onConfirm: (passengerData: {
    name: string;
    phone: string;
    pickup: string;
    dropoff: string;
  }) => void;
}) {
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [pickupStation, setPickupStation] = useState("");
  const [dropoffStation, setDropoffStation] = useState("");

  if (!isOpen || !schedule) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      name: passengerName,
      phone: passengerPhone,
      pickup: pickupStation,
      dropoff: dropoffStation,
    });
    setPassengerName("");
    setPassengerPhone("");
    setPickupStation("");
    setDropoffStation("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">ยืนยันการจอง</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Schedule Summary */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bus size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {schedule.bus.busNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {schedule.route.routeName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays size={16} />
              <span>{schedule.departureDate}</span>
              <Clock size={16} className="ml-2" />
              <span>{schedule.departureTime} น.</span>
            </div>
          </div>

          {/* Selected Seats */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              ที่นั่งที่เลือก ({selectedSeats.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium">
                  {seat}
                </span>
              ))}
            </div>
          </div>

          {/* Passenger Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อผู้โดยสาร
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="081-234-5678"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดขึ้นรถ
                </label>
                <input
                  type="text"
                  value={pickupStation}
                  onChange={(e) => setPickupStation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="สถานีขึ้นรถ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดลงรถ
                </label>
                <input
                  type="text"
                  value={dropoffStation}
                  onChange={(e) => setDropoffStation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="สถานีลงรถ"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">ราคารวม</span>
                <span className="text-xl font-bold text-blue-600">
                  ฿{selectedSeats.length * 350}
                </span>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <CreditCard size={20} />
                ยืนยันการจอง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState("2026-03-31");
  const [viewMode, setViewMode] = useState<"list" | "seatLayout">("list");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);

  // Mock booked seats for each schedule
  const [bookedSeatsMap, setBookedSeatsMap] = useState<
    Record<number, string[]>
  >({
    1: ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2", "F1", "F2"],
    2: [
      "A1",
      "A2",
      "A3",
      "A4",
      "B1",
      "B2",
      "B3",
      "B4",
      "C1",
      "C2",
      "C3",
      "C4",
      "D1",
      "D2",
      "D3",
      "D4",
      "E1",
      "E2",
      "E3",
      "E4",
      "F1",
      "F2",
      "F3",
      "F4",
      "G1",
      "G2",
    ],
    3: ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"],
    4: [
      "A1",
      "A2",
      "A3",
      "A4",
      "B1",
      "B2",
      "B3",
      "B4",
      "C1",
      "C2",
      "C3",
      "C4",
      "D1",
      "D2",
      "D3",
      "D4",
      "E1",
      "E2",
      "E3",
      "E4",
    ],
  });

  const filteredSchedules = mockSchedules.filter(
    (schedule) => schedule.departureDate === selectedDate,
  );

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setViewMode("seatLayout");
  };

  const handleSeatClick = (seatLabel: string) => {
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
    } else {
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setIsDriverMode(false); // Reset driver mode when going back
  };

  const handleConfirmBooking = (passengerData: {
    name: string;
    phone: string;
    pickup: string;
    dropoff: string;
  }) => {
    if (selectedSchedule) {
      // Add selected seats to booked seats
      setBookedSeatsMap((prev) => ({
        ...prev,
        [selectedSchedule.id]: [
          ...(prev[selectedSchedule.id] || []),
          ...selectedSeats,
        ],
      }));
      alert(
        `จองสำเร็จ!\nผู้โดยสาร: ${passengerData.name}\nที่นั่ง: ${selectedSeats.join(", ")}`,
      );
      setIsBookingModalOpen(false);
      setSelectedSeats([]);
    }
  };

  const nextDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const prevDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title={
            viewMode === "list"
              ? "จองตั๋วรถบัส"
              : `จองตั๋ว - ${selectedSchedule?.bus.busNumber}`
          }
          breadcrumbs={[
            "หน้าหลัก",
            viewMode === "list" ? "จองตั๋ว" : "เลือกที่นั่ง",
          ]}
        />
        <main className="p-4 sm:p-6">
          {viewMode === "list" ? (
            // Schedule List View
            <>
              {/* Date Navigation */}
              <div className="mb-6 flex items-center justify-center gap-4">
                <button
                  onClick={prevDate}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-500">วันที่เดินทาง</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </p>
                </div>
                <button
                  onClick={nextDate}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Schedules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSchedules.map((schedule) => {
                  const availableSeats =
                    schedule.bus.totalSeats - schedule.bookingsCount;
                  const occupancyRate =
                    (schedule.bookingsCount / schedule.bus.totalSeats) * 100;
                  const isFull = availableSeats === 0;

                  return (
                    <div
                      key={schedule.id}
                      onClick={() => !isFull && handleScheduleClick(schedule)}
                      className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition-all hover:shadow-md hover:border-blue-200 ${
                        isFull ? "opacity-60 cursor-not-allowed" : ""
                      }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${isFull ? "bg-red-100" : "bg-blue-100"}`}>
                            <Bus
                              size={20}
                              className={
                                isFull ? "text-red-600" : "text-blue-600"
                              }
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {schedule.bus.busNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {schedule.bus.type}
                            </p>
                          </div>
                        </div>
                        {isFull && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                            เต็ม
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPinned size={16} className="text-gray-400" />
                          <span className="text-sm">
                            {schedule.route.routeName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-sm font-medium">
                            {schedule.departureTime} น.
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Users size={14} />
                            ว่าง {availableSeats}/{schedule.bus.totalSeats}
                          </span>
                          <span
                            className={`font-medium ${
                              occupancyRate >= 80
                                ? "text-red-600"
                                : occupancyRate >= 50
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}>
                            {occupancyRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              occupancyRate >= 80
                                ? "bg-red-500"
                                : occupancyRate >= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(occupancyRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        disabled={isFull}
                        className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                          isFull
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}>
                        {isFull ? "เต็ม" : "เลือกเที่ยวนี้"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredSchedules.length === 0 && (
                <div className="text-center py-16">
                  <CalendarDays
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-500">ไม่พบรอบรถในวันที่เลือก</p>
                </div>
              )}
            </>
          ) : (
            // Seat Layout View
            selectedSchedule && (
              <>
                {/* Header with Driver Mode Toggle */}
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <ArrowLeft size={20} />
                      <span>กลับไปเลือกเที่ยวอื่น</span>
                    </button>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-blue-100 px-3 py-1 rounded-full">
                        {selectedSchedule.bus.busNumber}
                      </span>
                      <span>{selectedSchedule.route.routeName}</span>
                      <span>{selectedSchedule.departureTime} น.</span>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setIsDriverMode(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          !isDriverMode
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}>
                        <CreditCard size={16} />
                        โหมดจองตั๋ว
                      </button>
                      <button
                        onClick={() => setIsDriverMode(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          isDriverMode
                            ? "bg-white text-amber-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}>
                        <Eye size={16} />
                        โหมดคนขับ (ดูผัง)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Seat Layout */}
                  <div
                    className={
                      isDriverMode ? "lg:col-span-3" : "lg:col-span-2"
                    }>
                    <SeatLayout
                      layout={selectedSchedule.bus.layout}
                      bookedSeats={bookedSeatsMap[selectedSchedule.id] || []}
                      selectedSeats={selectedSeats}
                      onSeatClick={handleSeatClick}
                      readOnly={isDriverMode}
                    />
                  </div>

                  {/* Booking Panel - Hidden in Driver Mode */}
                  {!isDriverMode && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        สรุปการจอง
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">รถบัส</span>
                          <span className="font-medium">
                            {selectedSchedule.bus.busNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">เส้นทาง</span>
                          <span className="font-medium">
                            {selectedSchedule.route.routeName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">เวลา</span>
                          <span className="font-medium">
                            {selectedSchedule.departureTime} น.
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          ที่นั่งที่เลือก ({selectedSeats.length})
                        </p>
                        {selectedSeats.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((seat) => (
                              <span
                                key={seat}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium text-sm flex items-center gap-1">
                                {seat}
                                <button
                                  onClick={() => handleSeatClick(seat)}
                                  className="text-green-600 hover:text-green-800">
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            ยังไม่ได้เลือกที่นั่ง
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-600">ราคารวม</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ฿{selectedSeats.length * 350}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsBookingModalOpen(true)}
                          disabled={selectedSeats.length === 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
                          <CheckCircle size={20} />
                          ดำเนินการจอง
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• คลิกที่ที่นั่งสีฟ้าเพื่อเลือก</p>
                        <p>• คลิกอีกครั้งเพื่อยกเลิก</p>
                        <p>• ที่นั่งสีแดงถูกจองแล้ว</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </main>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        schedule={selectedSchedule}
        selectedSeats={selectedSeats}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
