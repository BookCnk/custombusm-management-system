"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPinned,
  Users,
} from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { apiRequest } from "@/lib/api-client";
import {
  buildBookedSeatsMap,
  mapSchedule,
  type ScheduleData,
} from "@/lib/bus-management";

interface BookingsPageClientProps {
  initialSelectedDate: string;
  initialSchedules: ScheduleData[];
}

export default function BookingsPageClient({
  initialSelectedDate,
  initialSchedules,
}: BookingsPageClientProps) {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [schedules, setSchedules] = useState<ScheduleData[]>(initialSchedules);
  const skipInitialLoadRef = useRef(true);

  // API: Load schedules for selected date
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

        if (cancelled) return;
        setSchedules(mapped);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load schedules:", error);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const bookedSeatsMap = buildBookedSeatsMap(schedules);

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
        <Header title="จองตั๋วรถบัส" breadcrumbs={["หน้าหลัก", "จองตั๋ว"]} />
        <main className="p-4 sm:p-6">
          {/* Date Picker */}
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

          {/* Schedule Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {schedules.map((schedule) => {
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
                  className={`bg-white rounded-xl shadow-sm border p-5 transition-all hover:shadow-md hover:border-blue-200 ${
                    isFull ? "opacity-60" : ""
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isFull ? "bg-red-100" : "bg-blue-100"}`}>
                        <Bus
                          size={20}
                          className={isFull ? "text-red-600" : "text-blue-600"}
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

                  <Link
                    href={`/bookings/${schedule.id}`}
                    className={`block w-full mt-4 py-2 rounded-lg font-medium text-center transition-colors ${
                      isFull
                        ? "bg-gray-100 text-gray-400 pointer-events-none"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}>
                    {isFull ? "เต็ม" : "เลือกรอบนี้"}
                  </Link>
                </div>
              );
            })}
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-16">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">ไม่พบรอบรถในวันที่เลือก</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
