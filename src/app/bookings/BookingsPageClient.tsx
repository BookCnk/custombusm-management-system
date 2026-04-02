"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPinned,
  Ticket,
  Users,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { apiRequest } from "@/lib/api-client";
import {
  buildBookedSeatsMap,
  mapSchedule,
  type ScheduleData,
  type SeatLayout as BusSeatLayout,
} from "@/lib/bus-management";

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
  layout: BusSeatLayout,
  bookedSeats: string[],
  selectedSeats: string[],
): Seat[][] => {
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
};

function SeatLayout({
  layout,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  readOnly = false,
}: {
  layout: BusSeatLayout;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatClick: (seatLabel: string) => void;
  readOnly?: boolean;
}) {
  const seats = generateSeats(layout, bookedSeats, selectedSeats);

  const getSeatStyle = (type: SeatType) => {
    if (readOnly) {
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
      default:
        return "w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-blue-600 transition-colors shadow-sm";
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
      <div className="min-w-[320px] max-w-[600px] mx-auto">
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

function BookingModal({
  isOpen,
  onClose,
  schedule,
  selectedSeats,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleData | null;
  selectedSeats: string[];
  onConfirm: (passengerData: {
    name: string;
    pickupStationId: number;
    dropoffStationId: number;
  }) => void;
}) {
  const [passengerName, setPassengerName] = useState("");
  const [pickupStationId, setPickupStationId] = useState<number | "">("");
  const [dropoffStationId, setDropoffStationId] = useState<number | "">("");
  const [error, setError] = useState("");

  if (!isOpen || !schedule) return null;

  const stations = schedule.route.stations;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pickupStationId || !dropoffStationId) {
      setError("กรุณาเลือกจุดขึ้นรถและจุดลงรถ");
      return;
    }

    if (pickupStationId === dropoffStationId) {
      setError("จุดขึ้นรถและจุดลงรถต้องไม่เหมือนกัน");
      return;
    }

    const pickupStation = stations.find((s) => s.id === pickupStationId);
    const dropoffStation = stations.find((s) => s.id === dropoffStationId);

    if (!pickupStation || !dropoffStation) {
      setError("ไม่พบสถานีที่เลือก");
      return;
    }

    if (pickupStation.stopOrder >= dropoffStation.stopOrder) {
      setError("จุดขึ้นรถต้องอยู่ก่อนจุดลงรถ");
      return;
    }

    onConfirm({
      name: passengerName,
      pickupStationId,
      dropoffStationId,
    });
    setPassengerName("");
    setPickupStationId("");
    setDropoffStationId("");
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อผู้โดยสาร (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่อ-นามสกุล (ถ้ามี)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดขึ้นรถ *
                </label>
                <select
                  value={pickupStationId}
                  onChange={(e) => setPickupStationId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required>
                  <option value="">เลือก</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดลงรถ *
                </label>
                <select
                  value={dropoffStationId}
                  onChange={(e) => setDropoffStationId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required>
                  <option value="">เลือก</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                ยืนยันการจอง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SuccessAlert({
  message,
  onClose,
  type = "success",
}: {
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
      <div
        className={`rounded-xl shadow-xl p-4 flex items-center gap-3 min-w-[300px] ${
          type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}>
        <div
          className={`p-2 rounded-full ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
          {type === "success" ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`font-medium ${
              type === "success" ? "text-green-900" : "text-red-900"
            }`}>
            {type === "success" ? "สำเร็จ!" : "เกิดข้อผิดพลาด"}
          </p>
          <p
            className={`text-sm ${
              type === "success" ? "text-green-700" : "text-red-700"
            }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors ${
            type === "success"
              ? "text-green-400 hover:text-green-600 hover:bg-green-100"
              : "text-red-400 hover:text-red-600 hover:bg-red-100"
          }`}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BookingsPageClient({
  initialSelectedDate,
  initialSchedules,
}: {
  initialSelectedDate: string;
  initialSchedules: ScheduleData[];
}) {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [viewMode, setViewMode] = useState<"list" | "seatLayout">("list");
  const [schedules, setSchedules] = useState<ScheduleData[]>(initialSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(
    null,
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const skipInitialLoadRef = useRef(true);

  const loadSchedules = async (date: string) => {
    const data = await apiRequest<unknown[]>(
      `/api/schedules?date=${encodeURIComponent(date)}`,
    );
    const mapped = data.map((item) => mapSchedule(item));
    setSchedules(mapped);
    return mapped;
  };

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<unknown[]>(
          `/api/schedules?date=${encodeURIComponent(selectedDate)}`,
        );
        const mapped = data.map((item) => mapSchedule(item));

        if (cancelled) {
          return;
        }

        setSchedules(mapped);
        setSelectedSchedule((current) => {
          if (!current) {
            return null;
          }

          return mapped.find((schedule) => schedule.id === current.id) || null;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดเที่ยวรถไม่สำเร็จ";
        setToast({ show: true, message, type: "error" });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const bookedSeatsMap = buildBookedSeatsMap(schedules);
  const filteredSchedules = schedules;

  const handleScheduleClick = (schedule: ScheduleData) => {
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
    setIsDriverMode(false);
  };

  const handleConfirmBooking = async (passengerData: {
    name: string;
    pickupStationId: number;
    dropoffStationId: number;
  }) => {
    if (!selectedSchedule) {
      return;
    }

    try {
      await Promise.all(
        selectedSeats.map((seatNumber) =>
          apiRequest("/api/bookings", {
            method: "POST",
            body: JSON.stringify({
              scheduleId: selectedSchedule.id,
              seatNumber,
              passengerName: passengerData.name.trim() || null,
              passengerPhone: null,
              pickupStationId: passengerData.pickupStationId,
              dropoffStationId: passengerData.dropoffStationId,
              price: 0,
            }),
          }),
        ),
      );

      const mapped = await loadSchedules(selectedDate);
      const refreshedSchedule =
        mapped.find((schedule) => schedule.id === selectedSchedule.id) || null;

      setSelectedSchedule(refreshedSchedule);
      setIsBookingModalOpen(false);
      setSelectedSeats([]);
      setToast({
        show: true,
        message: `จองสำเร็จ!${passengerData.name ? ` ผู้โดยสาร: ${passengerData.name}` : ""} ที่นั่ง: ${selectedSeats.join(", ")}`,
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ทำรายการจองไม่สำเร็จ";
      setToast({ show: true, message, type: "error" });
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
            <>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSchedules.map((schedule) => {
                  const bookedSeats = bookedSeatsMap[schedule.id] || [];
                  const availableSeats =
                    schedule.bus.totalSeats - bookedSeats.length;
                  const occupancyRate =
                    schedule.bus.totalSeats > 0
                      ? (bookedSeats.length / schedule.bus.totalSeats) * 100
                      : 0;
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
                        {isFull ? "เต็ม" : "เลือกรอบนี้"}
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
            selectedSchedule && (
              <>
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <ArrowLeft size={20} />
                      <span>กลับไปเลือกรอบอื่น</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setIsDriverMode(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          !isDriverMode
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}>
                        <Ticket size={16} />
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
                        โหมดคนขับ (ดูผังที่นั่ง)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                      <div className="border-t border-gray-200 pt-4">
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

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        schedule={selectedSchedule}
        selectedSeats={selectedSeats}
        onConfirm={(passengerData) => {
          void handleConfirmBooking(passengerData);
        }}
      />

      {toast.show && (
        <SuccessAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
