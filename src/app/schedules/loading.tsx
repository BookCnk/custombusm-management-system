import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Bus, CalendarDays, Clock, MapPinned, Plus, Search, Users } from "lucide-react";

export default function SchedulesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการตารางเดินรถ"
          breadcrumbs={["หน้าหลัก", "ตารางเดินรถ"]}
        />
        <main className="p-4 sm:p-6">
          {/* Toolbar Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg">
              <Plus className="w-5 h-5" />
              <span>เพิ่มรอบเดินรถ</span>
            </button>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Bus className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Bus className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <MapPinned className="w-4 h-4 text-gray-300" />
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Users className="w-4 h-4 text-gray-300" />
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-100 rounded-lg" />
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
