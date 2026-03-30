"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";

const mockBookings = [
  {
    id: 1,
    passengerName: "สมชาย ใจดี",
    passengerPhone: "081-234-5678",
    schedule: {
      bus: { busNumber: "815-1" },
      route: { routeName: "ราชสีมา - ระยอง" },
      departureTime: "08:30",
    },
    seatNumber: "A12",
    pickupStation: "ปักธงชัย",
    dropoffStation: "ระยอง",
    price: 350,
    status: "CONFIRMED",
    createdAt: "2026-03-30 14:25",
  },
  {
    id: 2,
    passengerName: "สมหญิง รักเรียน",
    passengerPhone: "089-876-5432",
    schedule: {
      bus: { busNumber: "VIP-02" },
      route: { routeName: "โคราช - กรุงเทพ" },
      departureTime: "10:00",
    },
    seatNumber: "B05",
    pickupStation: "โคราช",
    dropoffStation: "กรุงเทพ",
    price: 420,
    status: "CONFIRMED",
    createdAt: "2026-03-30 16:10",
  },
  {
    id: 3,
    passengerName: "ประเสริฐ มากมี",
    passengerPhone: "086-123-4567",
    schedule: {
      bus: { busNumber: "815-1" },
      route: { routeName: "ราชสีมา - ระยอง" },
      departureTime: "08:30",
    },
    seatNumber: "C08",
    pickupStation: "กบินทร์บุรี",
    dropoffStation: "บ่อวิน",
    price: 200,
    status: "CONFIRMED",
    createdAt: "2026-03-31 08:15",
  },
  {
    id: 4,
    passengerName: "มานี มานะ",
    passengerPhone: "090-987-6543",
    schedule: {
      bus: { busNumber: "815-3" },
      route: { routeName: "ราชสีมา - ระยอง" },
      departureTime: "14:30",
    },
    seatNumber: "A01",
    pickupStation: "โคราช",
    dropoffStation: "ระยอง",
    price: 350,
    status: "CANCELLED",
    createdAt: "2026-03-29 10:00",
  },
];

export default function BookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "CONFIRMED" | "CANCELLED"
  >("ALL");

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.passengerPhone.includes(searchQuery) ||
      booking.schedule.bus.busNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="การจองที่นั่ง"
          breadcrumbs={["หน้าหลัก", "การจองที่นั่ง"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-lg border border-gray-100 bg-white px-4 py-2 shadow-sm">
                <span className="text-sm text-gray-500">รายได้รวม: </span>
                <span className="font-semibold text-gray-900">
                  ฿{totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white px-4 py-2 shadow-sm">
                <span className="text-sm text-gray-500">จำนวนการจอง: </span>
                <span className="font-semibold text-gray-900">
                  {filteredBookings.length} รายการ
                </span>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 lg:w-auto">
              <Plus size={20} />
              <span>เพิ่มการจอง</span>
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, เบอร์โทร, หมายเลขรถ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}>
                  {status === "ALL"
                    ? "ทั้งหมด"
                    : status === "CONFIRMED"
                      ? "ยืนยันแล้ว"
                      : "ยกเลิก"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      ผู้โดยสาร
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      เที่ยวรถ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      ที่นั่ง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      จุดขึ้น-ลง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      ราคา
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.passengerName}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone size={14} />
                            {booking.passengerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.schedule.route.routeName}
                          </p>
                          <p className="text-xs text-gray-500">
                            รถ {booking.schedule.bus.busNumber} •{" "}
                            {booking.schedule.departureTime} น.
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 py-1 font-medium text-blue-700">
                          {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{booking.pickupStation}</span>
                          <span className="text-gray-400">→</span>
                          <span>{booking.dropoffStation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          ฿{booking.price}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {booking.status === "CONFIRMED" ? (
                            <>
                              <CheckCircle size={12} />
                              ยืนยันแล้ว
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              ยกเลิก
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <Edit size={18} />
                          </button>
                          <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 lg:hidden">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {booking.passengerName}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <Phone size={14} />
                        {booking.passengerPhone}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {booking.status === "CONFIRMED" ? (
                        <>
                          <CheckCircle size={12} />
                          เธขเธทเธเธขเธฑเธเนเธฅเนเธง
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          เธขเธเน€เธฅเธดเธ
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.schedule.route.routeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      รถ {booking.schedule.bus.busNumber} •{" "}
                      {booking.schedule.departureTime} น.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center justify-center rounded-lg bg-blue-100 px-3 py-1 font-medium text-blue-700">
                      {booking.seatNumber}
                    </span>
                    <span className="font-medium text-gray-900">
                      ฿{booking.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} className="shrink-0 text-gray-400" />
                    <span className="truncate">{booking.pickupStation}</span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate">{booking.dropoffStation}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                      <Edit size={18} />
                    </button>
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
