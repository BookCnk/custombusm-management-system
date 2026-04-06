"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Plus,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

interface BusData {
  id: number;
  busNumber: string;
  type: string;
  totalSeats: number;
  status: string;
}

interface RouteData {
  id: number;
  routeName: string;
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
  _count?: {
    bookings: number;
  };
}

interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface RevenueRangeResponse {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalBookings: number;
  daily: DailyRevenue[];
}

interface MonthlyRevenueResponse {
  endMonth: string;
  months: number;
  totalRevenue: number;
  totalBookings: number;
  monthly: MonthlyRevenue[];
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthString() {
  return getTodayDateString().slice(0, 7);
}

function getDateDaysAgo(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function getDateDaysFrom(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatThaiDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortThaiDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
  });
}

function formatThaiMonth(value: string) {
  return new Date(`${value}-01`).toLocaleDateString("th-TH", {
    month: "short",
    year: "2-digit",
  });
}

const STAT_STYLES = {
  blue: {
    icon: "bg-blue-100 text-blue-600",
    accent: "text-blue-600",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-600",
    accent: "text-emerald-600",
  },
  orange: {
    icon: "bg-amber-100 text-amber-600",
    accent: "text-amber-600",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600",
    accent: "text-rose-600",
  },
} as const;

export default function DashboardPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<ScheduleData[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const rangeStart = getDateDaysAgo(selectedDate, 6);

        const [busesData, routesData, schedulesData, revenueRange, monthlySummary] =
          await Promise.all([
            apiRequest<BusData[]>("/api/buses"),
            apiRequest<RouteData[]>("/api/routes"),
            apiRequest<ScheduleData[]>(`/api/schedules?date=${selectedDate}`),
            apiRequest<RevenueRangeResponse>(
              `/api/bookings/revenue?startDate=${rangeStart}&endDate=${selectedDate}`,
            ),
            apiRequest<MonthlyRevenueResponse>(
              `/api/bookings/revenue?groupBy=month&months=6&endMonth=${selectedMonth}`,
            ),
          ]);

        setBuses(busesData);
        setRoutes(routesData);
        setSelectedDaySchedules(schedulesData);
        setDailyRevenue(revenueRange.daily);
        setMonthlyRevenue(monthlySummary.monthly);
      } catch (fetchError) {
        console.error("Error fetching dashboard data:", fetchError);
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboardData();
  }, [selectedDate, selectedMonth]);

  const activeBuses = buses.filter((bus) => bus.status === "active").length;
  const totalSeatsOnSelectedDay = selectedDaySchedules.reduce(
    (sum, schedule) => sum + schedule.bus.totalSeats,
    0,
  );
  const selectedDayBookings = selectedDaySchedules.reduce(
    (sum, schedule) => sum + (schedule._count?.bookings || 0),
    0,
  );
  const occupancyRate =
    totalSeatsOnSelectedDay > 0
      ? Math.round((selectedDayBookings / totalSeatsOnSelectedDay) * 100)
      : 0;
  const selectedDayRevenue =
    dailyRevenue.find((day) => day.date === selectedDate) ?? {
      date: selectedDate,
      revenue: 0,
      bookings: 0,
    };
  const totalRangeRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
  const averageRangeRevenue = dailyRevenue.length
    ? Math.round(totalRangeRevenue / dailyRevenue.length)
    : 0;
  const bestDay =
    dailyRevenue.reduce<DailyRevenue | null>(
      (best, current) =>
        !best || current.revenue > best.revenue ? current : best,
      null,
    ) ?? selectedDayRevenue;
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1);

  const stats = [
    {
      icon: Bus,
      label: "จำนวนรถบัส",
      value: buses.length.toLocaleString("th-TH"),
      change: `${activeBuses.toLocaleString("th-TH")} คันพร้อมใช้งาน`,
      tone: "blue" as const,
    },
    {
      icon: MapPinned,
      label: "เส้นทางทั้งหมด",
      value: routes.length.toLocaleString("th-TH"),
      change: "พร้อมให้บริการทุกวัน",
      tone: "green" as const,
    },
    {
      icon: CalendarDays,
      label: "รอบเดินรถวันที่เลือก",
      value: selectedDaySchedules.length.toLocaleString("th-TH"),
      change: formatThaiDate(selectedDate),
      tone: "orange" as const,
    },
    {
      icon: Ticket,
      label: "อัตราการจอง",
      value: `${occupancyRate}%`,
      change: `${selectedDayBookings.toLocaleString("th-TH")} ที่นั่งถูกจอง`,
      tone: "rose" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 min-w-0 transition-all duration-300">
          <Header title="แดชบอร์ด" breadcrumbs={["หน้าหลัก", "แดชบอร์ด"]} />
          <main className="p-4 sm:p-6">
            <div className="flex h-64 items-center justify-center">
              <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
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
            <div className="flex h-64 items-center justify-center">
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
        <main className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const style = STAT_STYLES[stat.tone];

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`rounded-2xl p-3 ${style.icon}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <p className={`mt-4 flex items-center gap-1 text-xs ${style.accent}`}>
                    <TrendingUp size={14} />
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 px-5 py-6 text-white sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-100/80">
                    Revenue Overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    ภาพรวมรายได้ พร้อมดูย้อนหลังตามวันที่ต้องการ
                  </h2>
                  <p className="mt-2 text-sm text-blue-100/80">
                    เลือกวันที่เพื่อดูยอดรายวันย้อนหลัง 7 วัน และเลือกเดือนเพื่อดูสรุปรายได้รายเดือน
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <span className="mb-2 block text-xs font-medium text-blue-100/80">
                      วันที่อ้างอิง
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(getDateDaysAgo(selectedDate, 1))}
                        className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20">
                        <ChevronLeft size={16} />
                      </button>
                      <input
                        type="date"
                        value={selectedDate}
                        max={getTodayDateString()}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-950/25 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDate((current) => {
                            const next = getDateDaysFrom(current, 1);
                            return next > getTodayDateString() ? getTodayDateString() : next;
                          })
                        }
                        className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </label>

                  <label className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <span className="mb-2 block text-xs font-medium text-blue-100/80">
                      เดือนสำหรับสรุป
                    </span>
                    <input
                      type="month"
                      value={selectedMonth}
                      max={getCurrentMonthString()}
                      onChange={(event) => setSelectedMonth(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-slate-950/25 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
                    />
                  </label>

                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 backdrop-blur">
                    <p className="text-xs font-medium text-emerald-100/80">
                      รายได้วันที่เลือก
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(selectedDayRevenue.revenue)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-100/80">
                      {selectedDayRevenue.bookings.toLocaleString("th-TH")} รายการจอง
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 xl:grid-cols-[1.35fr,0.85fr]">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      รายได้ย้อนหลัง 7 วัน
                    </h3>
                    <p className="text-sm text-slate-500">
                      ช่วง {formatThaiDate(dailyRevenue[0]?.date ?? selectedDate)} ถึง{" "}
                      {formatThaiDate(selectedDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                    รายได้
                  </div>
                </div>

                <div className="-mx-1 overflow-x-auto pb-2">
                  <div className="grid min-w-[760px] grid-cols-3 gap-3 px-1">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        รวม 7 วัน
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {formatCurrency(totalRangeRevenue)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        เฉลี่ยต่อวัน
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {formatCurrency(averageRangeRevenue)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        วันที่ทำได้สูงสุด
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {formatCurrency(bestDay.revenue)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatShortThaiDate(bestDay.date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="h-72 rounded-3xl bg-white p-3 shadow-sm sm:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyRevenue} barGap={10}>
                      <defs>
                        <linearGradient id="dailyRevenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.75} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={formatShortThaiDate}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                      />
                      <Tooltip
                        cursor={{ fill: "#eff6ff" }}
                        contentStyle={{
                          borderRadius: 16,
                          borderColor: "#dbeafe",
                          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                        }}
                        formatter={(value, _name, item) => [
                          formatCurrency(Number(value) || 0),
                          `รายได้ (${item.payload?.bookings ?? 0} จอง)`,
                        ]}
                        labelFormatter={(label) => formatThaiDate(String(label))}
                      />
                          <Bar
                            dataKey="revenue"
                            fill="url(#dailyRevenueFill)"
                            radius={[14, 14, 6, 6]}>
                            {dailyRevenue.map((day) => (
                              <Cell
                                key={day.date}
                                fill={day.date === selectedDate ? "#0f766e" : undefined}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                      <Wallet size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">สรุปของวันที่เลือก</p>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {formatThaiDate(selectedDate)}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">รายได้รวม</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCurrency(selectedDayRevenue.revenue)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">ยอดจอง</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {selectedDayRevenue.bookings.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          รอบเดินรถ
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {selectedDaySchedules.length.toLocaleString("th-TH")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        สรุปรายเดือน
                      </h3>
                      <p className="text-sm text-slate-500">
                        ย้อนหลัง 6 เดือนถึง {formatThaiMonth(selectedMonth)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {monthlyRevenue.map((month) => (
                      <div
                        key={month.month}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {formatThaiMonth(month.month)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {month.bookings.toLocaleString("th-TH")} รายการ
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(month.revenue)}
                          </p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                            style={{
                              width: `${Math.max((month.revenue / maxMonthlyRevenue) * 100, 6)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 h-36 rounded-3xl bg-slate-50 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenue}>
                        <defs>
                          <linearGradient id="monthlyRevenueArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickFormatter={formatThaiMonth}
                        />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(Number(value) || 0),
                            "รายได้เดือน",
                          ]}
                          labelFormatter={(label) => formatThaiMonth(String(label))}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0f766e"
                          fill="url(#monthlyRevenueArea)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">ตารางเดินรถของวันที่เลือก</h3>
                <p className="text-sm text-gray-500">{formatThaiDate(selectedDate)}</p>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
                <Plus size={18} />
                <span>เพิ่มรอบ</span>
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {selectedDaySchedules.length > 0 ? (
                selectedDaySchedules.map((schedule) => {
                  const bookedCount = schedule._count?.bookings || 0;
                  const totalSeats = schedule.bus.totalSeats;
                  const isFull = bookedCount >= totalSeats;
                  const isActive =
                    selectedDate === getTodayDateString() &&
                    new Date().toTimeString().slice(0, 5) >= schedule.departureTime;

                  return (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-3 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`h-12 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-blue-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {schedule.route.routeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            รถ {schedule.bus.busNumber} เวลา {schedule.departureTime} น.
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
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                              เต็ม
                            </span>
                          )}
                        </div>
                        <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200 sm:ml-auto">
                          <div
                            className="h-full rounded-full bg-blue-500"
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
                  ไม่มีตารางเดินรถสำหรับวันที่เลือก
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
