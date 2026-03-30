"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MapPin, Plus, Search, Edit, Trash2 } from "lucide-react";

const mockStations = [
  {
    id: 1,
    stationName: "ปักธงชัย",
    routeName: "ราชสีมา - ระยอง",
    stopOrder: 1,
  },
  {
    id: 2,
    stationName: "กบินทร์บุรี",
    routeName: "ราชสีมา - ระยอง",
    stopOrder: 2,
  },
  { id: 3, stationName: "บ่อวิน", routeName: "ราชสีมา - ระยอง", stopOrder: 3 },
  { id: 4, stationName: "ระยอง", routeName: "ราชสีมา - ระยอง", stopOrder: 4 },
  { id: 5, stationName: "โคราช", routeName: "โคราช - กรุงเทพ", stopOrder: 1 },
  { id: 6, stationName: "ปากช่อง", routeName: "โคราช - กรุงเทพ", stopOrder: 2 },
  {
    id: 7,
    stationName: "วังน้ำเขียว",
    routeName: "โคราช - กรุงเทพ",
    stopOrder: 3,
  },
  { id: 8, stationName: "กรุงเทพ", routeName: "โคราช - กรุงเทพ", stopOrder: 4 },
];

export default function StationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStations = mockStations.filter(
    (station) =>
      station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.routeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการจุดจอด"
          breadcrumbs={["หน้าหลัก", "จัดการจุดจอด"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาจุดจอด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
              <Plus size={20} />
              <span>เพิ่มจุดจอด</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      ลำดับ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      ชื่อจุดจอด
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      เส้นทาง
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-500">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStations.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                          {station.stopOrder}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2">
                            <MapPin size={18} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {station.stationName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {station.routeName}
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

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredStations.map((station) => (
                <div key={station.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                        {station.stopOrder}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {station.stationName}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {station.routeName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                        <Edit size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
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
