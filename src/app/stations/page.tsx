"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Search, Edit, Trash2, X } from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import CustomSelect from "../components/CustomSelect";
import { apiRequest } from "@/lib/api-client";
import {
  mapRoute,
  mapRouteStation,
  type RouteData,
  type RouteStationData,
} from "@/lib/bus-management";

type StationRow = RouteStationData & { routeName: string };

export default function StationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<StationRow[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    routeId: "",
    stationName: "",
    stopOrder: "",
  });

  const loadStations = async () => {
    const query = searchQuery.trim();
    const data = await apiRequest<unknown[]>(
      `/api/stations${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    );

    setStations(
      data.map((item) => {
        const station = mapRouteStation(item);
        const route =
          typeof item === "object" && item !== null && "route" in item
            ? mapRoute((item as { route?: unknown }).route)
            : undefined;

        return {
          ...station,
          routeName: route?.routeName ?? "",
        };
      }),
    );
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const query = searchQuery.trim();
        const [routeData, stationData] = await Promise.all([
          apiRequest<unknown[]>("/api/routes"),
          apiRequest<unknown[]>(
            `/api/stations${query ? `?q=${encodeURIComponent(query)}` : ""}`,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setRoutes(routeData.map((item) => mapRoute(item)));
        setStations(
          stationData.map((item) => {
            const station = mapRouteStation(item);
            const route =
              typeof item === "object" && item !== null && "route" in item
                ? mapRoute((item as { route?: unknown }).route)
                : undefined;

            return {
              ...station,
              routeName: route?.routeName ?? "",
            };
          }),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดข้อมูลจุดจอดไม่สำเร็จ";
        alert(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleOpenCreateModal = () => {
    setFormData({ routeId: "", stationName: "", stopOrder: "" });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({ routeId: "", stationName: "", stopOrder: "" });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const routeId = Number(formData.routeId);
    const stationName = formData.stationName.trim();
    const stopOrder = Number(formData.stopOrder);

    if (!routeId || !stationName || !stopOrder) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      await apiRequest("/api/stations", {
        method: "POST",
        body: JSON.stringify({
          routeId,
          stationName,
          stopOrder,
        }),
      });
      await loadStations();
      handleCloseCreateModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เพิ่มจุดจอดไม่สำเร็จ";
      alert(message);
    }
  };

  const handleEdit = async (station: StationRow) => {
    const stationName = window.prompt("แก้ไขชื่อจุดจอด", station.stationName);
    const stopOrder = window.prompt(
      "แก้ไขลำดับจุดจอด",
      station.stopOrder.toString(),
    );

    if (!stationName?.trim() || !stopOrder) {
      return;
    }

    try {
      await apiRequest(`/api/stations/${station.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          stationName: stationName.trim(),
          stopOrder: Number(stopOrder),
        }),
      });
      await loadStations();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "แก้ไขจุดจอดไม่สำเร็จ";
      alert(message);
    }
  };

  const handleDelete = async (station: StationRow) => {
    if (!window.confirm(`ต้องการลบจุดจอด ${station.stationName} ใช่หรือไม่?`)) {
      return;
    }

    try {
      await apiRequest(`/api/stations/${station.id}`, {
        method: "DELETE",
      });
      await loadStations();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบจุดจอดไม่สำเร็จ";
      alert(message);
    }
  };

  const filteredStations = stations.filter(
    (station) =>
      station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.routeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการจุดจอด"
          breadcrumbs={["หน้าหลัก", "จัดการจุดจอด"]}
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
            <button
              onClick={handleOpenCreateModal}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
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
                          <button
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => void handleEdit(station)}>
                            <Edit size={18} />
                          </button>
                          <button
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            onClick={() => void handleDelete(station)}>
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
                      <button
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => void handleEdit(station)}>
                        <Edit size={18} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        onClick={() => void handleDelete(station)}>
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                เพิ่มจุดจอดใหม่
              </h3>
              <button
                onClick={handleCloseCreateModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  เส้นทาง
                </label>
                <CustomSelect
                  value={formData.routeId}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      routeId: value.toString(),
                    }))
                  }
                  options={[
                    { value: "", label: "-- เลือกเส้นทาง --" },
                    ...routes.map((route) => ({
                      value: route.id.toString(),
                      label: route.routeName,
                    })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อจุดจอด
                </label>
                <input
                  type="text"
                  value={formData.stationName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stationName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น โคราช"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ลำดับจุดจอด
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.stopOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stopOrder: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1, 2, 3, ..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
