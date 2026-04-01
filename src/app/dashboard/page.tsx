"use client";

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

const stats = [
  {
    icon: Bus,
    label: "จำนวนรถบัส",
    value: "12",
    change: "+2 จากเดือนที่แล้ว",
    color: "blue",
  },
  {
    icon: MapPinned,
    label: "เส้นทางทั้งหมด",
    value: "8",
    change: "+1 ใหม่",
    color: "green",
  },
  {
    icon: CalendarDays,
    label: "ตารางเดินรถวันนี้",
    value: "24",
    change: "3 รอบเต็ม",
    color: "orange",
  },
  {
    icon: Ticket,
    label: "การจองวันนี้",
    value: "156",
    change: "+12% จากเมื่อวาน",
    color: "purple",
  },
];

const recentBookings = [
  {
    id: 1,
    passenger: "สมชาย ใจดี",
    phone: "081-234-5678",
    route: "ราชสีมา - ระยอง",
    seat: "A12",
    price: 350,
    status: "confirmed",
  },
  {
    id: 2,
    passenger: "สมหญิง รักเรียน",
    phone: "089-876-5432",
    route: "โคราช - กรุงเทพ",
    seat: "B05",
    price: 420,
    status: "confirmed",
  },
  {
    id: 3,
    passenger: "ประเสริฐ มากมี",
    phone: "086-123-4567",
    route: "ราชสีมา - ระยอง",
    seat: "C08",
    price: 350,
    status: "pending",
  },
];

const todaySchedules = [
  {
    id: 1,
    bus: "815-1",
    route: "ราชสีมา - ระยอง",
    time: "08:30",
    seats: { booked: 35, total: 40 },
    status: "active",
  },
  {
    id: 2,
    bus: "VIP-02",
    route: "โคราช - กรุงเทพ",
    time: "10:00",
    seats: { booked: 28, total: 32 },
    status: "active",
  },
  {
    id: 3,
    bus: "815-3",
    route: "ราชสีมา - ระยอง",
    time: "14:30",
    seats: { booked: 12, total: 40 },
    status: "upcoming",
  },
];

export default function DashboardPage() {
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedules */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ตารางเดินรถวันนี้
                  </h3>
                  <p className="text-sm text-gray-500">31 มีนาคม 2026</p>
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
                  <Plus size={18} />
                  <span>เพิ่มรอบ</span>
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex flex-col gap-3 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`w-2 h-12 rounded-full ${schedule.status === "active" ? "bg-green-500" : "bg-blue-500"}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {schedule.route}
                        </p>
                        <p className="text-sm text-gray-500">
                          รถ {schedule.bus} • {schedule.time} น.
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>
                          {schedule.seats.booked}/{schedule.seats.total}
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(schedule.seats.booked / schedule.seats.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  การจองล่าสุด
                </h3>
                <p className="text-sm text-gray-500">
                  อัพเดทล่าสุด 5 นาทีที่แล้ว
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-gray-900">
                        {booking.passenger}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {booking.status === "confirmed"
                          ? "ยืนยันแล้ว"
                          : "รอดำเนินการ"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{booking.route}</p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-600">
                        ที่นั่ง {booking.seat}
                      </span>
                      <span className="font-medium text-gray-900">
                        ฿{booking.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
