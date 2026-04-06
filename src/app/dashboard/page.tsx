"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  Bus,
  MapPinned,
  CalendarDays,
  Ticket,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface BusData {
  id: number;
  busNumber: string;
  type: string;
  totalSeats: number;
  status: string;
  _count?: {
    schedules: number;
  };
}

interface RouteData {
  id: number;
  routeName: string;
  stations?: Array<{
    id: number;
    stationName: string;
  }>;
}

interface ScheduleData {
  id: number;
  departureDate: string;
  departureTime: string;
  bus: {
    id: number;
    busNumber: string;
    totalSeats: number;
  };
  route: {
    id: number;
    routeName: string;
  };
  bookings: Array<{
    seatNumber: string;
    status: string;
    price: number;
  }>;
  _count?: {
    bookings: number;
  };
}

interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueResponse {
  totalRevenue: number;
  totalBookings: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<ScheduleData[]>([]);
  const [todayBookings, setTodayBookings] = useState<number>(0);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [busesData, routesData, schedulesData] = await Promise.all([
        apiRequest<BusData[]>("/api/buses"),
        apiRequest<RouteData[]>("/api/routes"),
        apiRequest<ScheduleData[]>(`/api/schedules?date=${getTodayDateString()}`),
      ]);

      setBuses(busesData);
      setRoutes(routesData);
      setTodaySchedules(schedulesData);

      const totalBookings = schedulesData.reduce(
        (sum: number, schedule: ScheduleData) =>
          sum + (schedule._count?.bookings || 0),
        0,
      );
      setTodayBookings(totalBookings);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const revenueDates: string[] = [];
      const revenuePromises: Array<Promise<RevenueResponse>> = [];

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        revenueDates.push(dateStr);
        revenuePromises.push(
          apiRequest<RevenueResponse>(`/api/bookings/revenue?date=${dateStr}`),
        );
      }

      const revenueResponses = await Promise.all(revenuePromises);
      const revenueData: DailyRevenue[] = revenueResponses.map((data, index) => ({
        date: revenueDates[index],
        revenue: data.totalRevenue || 0,
        bookings: data.totalBookings || 0,
      }));

      setDailyRevenue(revenueData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const activeBuses = buses.filter((b) => b.status === "active").length;
  const totalBuses = buses.length;
  const totalRoutes = routes.length;
  const todayScheduleCount = todaySchedules.length;

  // Calculate occupancy rate for today
  const totalSeatsToday = todaySchedules.reduce(
    (sum, s) => sum + s.bus.totalSeats,
    0,
  );
  const occupancyRate =
    totalSeatsToday > 0
      ? Math.round((todayBookings / totalSeatsToday) * 100)
      : 0;

  const stats = [
    {
      icon: Bus,
      label: "จำนวนรถบัส",
      value: totalBuses.toString(),
      change: `${activeBuses} คันใช้งานได้`,
      color: "blue",
    },
    {
      icon: MapPinned,
      label: "เส้นทางทั้งหมด",
      value: totalRoutes.toString(),
      change: "ใช้งานอยู่",
      color: "green",
    },
    {
      icon: CalendarDays,
      label: "ตารางเดินรถวันนี้",
      value: todayScheduleCount.toString(),
      change: `${todaySchedules.filter((s) => (s._count?.bookings || 0) >= s.bus.totalSeats).length} รอบเต็ม`,
      color: "orange",
    },
    {
      icon: Ticket,
      label: "การจองวันนี้",
      value: todayBookings.toString(),
      change: `${occupancyRate}% อัตราการจอง`,
      color: "purple",
    },
  ];

  const todayDateString = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 min-w-0 transition-all duration-300">
          <Header title="แดชบอร์ด" breadcrumbs={["หน้าหลัก", "แดชบอร์ด"]} />
          <main className="p-4 sm:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">กำลังโหลด...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 min-w-0 transition-all duration-300">
          <Header title="แดชบอร์ด" breadcrumbs={["หน้าหลัก", "แดชบอร์ด"]} />
          <main className="p-4 sm:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header title="แดชบอร์ด" breadcrumbs={["หน้าหลัก", "แดชบอร์ด"]} />
        <main className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                      <Icon size={24} className={`text-${stat.color}-600`} />
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <TrendingUp size={14} />
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                รายได้รายวัน (7 วันล่าสุด)
              </h3>
              <p className="text-sm text-gray-500">
                แสดงรายได้และจำนวนการจองในแต่ละวัน
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {dailyRevenue.map((day) => {
                  const heightPercentage = (day.revenue / maxRevenue) * 100;
                  const isToday = day.date === getTodayDateString();

                  return (
                    <div
                      key={day.date}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div className="relative flex h-52 w-full items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isToday ? "bg-blue-500" : "bg-gray-300"
                          }`}
                          style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                        />
                        <div className="absolute -top-6 text-xs font-medium text-gray-700">
                          ฿{day.revenue.toLocaleString("th-TH")}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        <div>
                          {new Date(day.date).toLocaleDateString("th-TH", {
                            weekday: "short",
                          })}
                        </div>
                        <div>{new Date(day.date).getDate()}</div>
                        <div className="text-xs text-gray-500">
                          {day.bookings} จอง
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today's Schedules - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  ตารางเดินรถวันนี้
                </h3>
                <p className="text-sm text-gray-500">{todayDateString}</p>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
                <Plus size={18} />
                <span>เพิ่มรอบ</span>
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => {
                  const bookedCount = schedule._count?.bookings || 0;
                  const totalSeats = schedule.bus.totalSeats;
                  const isFull = bookedCount >= totalSeats;
                  const isActive =
                    new Date().toTimeString().slice(0, 5) >=
                    schedule.departureTime;

                  return (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-3 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`w-2 h-12 rounded-full ${isActive ? "bg-green-500" : "bg-blue-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {schedule.route.routeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            รถ {schedule.bus.busNumber} •{" "}
                            {schedule.departureTime} น.
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={16} />
                          <span>
                            {bookedCount}/{totalSeats}
                          </span>
                          {isFull && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              เต็ม
                            </span>
                          )}
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min((bookedCount / totalSeats) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  ไม่มีตารางเดินรถวันนี้
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
