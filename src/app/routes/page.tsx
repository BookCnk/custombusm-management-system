"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MapPinned, Plus, Search, Edit, Trash2, MapPin } from "lucide-react";

const mockRoutes = [
  {
    id: 1,
    routeName: "ราชสีมา - ระยอง",
    stations: [
      { id: 1, stationName: "ปักธงชัย", stopOrder: 1 },
      { id: 2, stationName: "กบินทร์บุรี", stopOrder: 2 },
      { id: 3, stationName: "บ่อวิน", stopOrder: 3 },
      { id: 4, stationName: "ระยอง", stopOrder: 4 },
    ],
  },
  {
    id: 2,
    routeName: "โคราช - กรุงเทพ",
    stations: [
      { id: 5, stationName: "โคราช", stopOrder: 1 },
      { id: 6, stationName: "ปากช่อง", stopOrder: 2 },
      { id: 7, stationName: "วังน้ำเขียว", stopOrder: 3 },
      { id: 8, stationName: "กรุงเทพ", stopOrder: 4 },
    ],
  },
  {
    id: 3,
    routeName: "ราชสีมา - ขอนแก่น",
    stations: [
      { id: 9, stationName: "โคราช", stopOrder: 1 },
      { id: 10, stationName: "บัวใหญ่", stopOrder: 2 },
      { id: 11, stationName: "ขอนแก่น", stopOrder: 3 },
    ],
  },
];

export default function RoutesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoute, setExpandedRoute] = useState<number | null>(1);

  const filteredRoutes = mockRoutes.filter((route) =>
    route.routeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการเส้นทาง"
          breadcrumbs={["หน้าหลัก", "จัดการเส้นทาง"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ค้นหาเส้นทาง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
              <Plus size={20} />
              <span>เพิ่มเส้นทาง</span>
            </button>
          </div>

          {/* Routes List */}
          <div className="space-y-4">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="flex cursor-pointer flex-col gap-4 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}>
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MapPinned size={24} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-900">{route.routeName}</h3>
                      <p className="text-sm text-gray-500">{route.stations.length} จุดจอด</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}>
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Stations */}
                {expandedRoute === route.id && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">จุดจอดตามลำดับ:</h4>
                      <div className="flex flex-wrap gap-3">
                        {route.stations.map((station, index) => (
                          <div key={station.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                              <MapPin size={16} className="text-blue-500" />
                              <span className="text-sm text-gray-700">{station.stationName}</span>
                            </div>
                            {index < route.stations.length - 1 && (
                              <span className="text-gray-400">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
