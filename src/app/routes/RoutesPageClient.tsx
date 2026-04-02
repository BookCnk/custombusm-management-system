"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPinned,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  X,
  AlertTriangle,
} from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { apiRequest } from "@/lib/api-client";
import { mapRoute, type RouteData } from "@/lib/bus-management";

export default function RoutesPageClient({
  initialRoutes,
}: {
  initialRoutes: RouteData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoute, setExpandedRoute] = useState<number | null>(
    initialRoutes[0]?.id ?? null,
  );
  const [routes, setRoutes] = useState<RouteData[]>(initialRoutes);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    routeName: "",
    stationsInput: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    routeName: "",
    stationsInput: "",
  });
  const skipInitialLoadRef = useRef(true);

  const loadRoutes = async () => {
    try {
      const query = searchQuery.trim();
      const data = await apiRequest<unknown[]>(
        `/api/routes${query ? `?q=${encodeURIComponent(query)}` : ""}`,
      );
      const mapped = data.map((item) => mapRoute(item));
      setRoutes(mapped);
      setExpandedRoute((current) =>
        current && mapped.some((route) => route.id === current)
          ? current
          : (mapped[0]?.id ?? null),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "โหลดข้อมูลเส้นทางไม่สำเร็จ";
      alert(message);
    }
  };

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const query = searchQuery.trim();
        const data = await apiRequest<unknown[]>(
          `/api/routes${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        );
        const mapped = data.map((item) => mapRoute(item));

        if (cancelled) {
          return;
        }

        setRoutes(mapped);
        setExpandedRoute((current) =>
          current && mapped.some((route) => route.id === current)
            ? current
            : (mapped[0]?.id ?? null),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดข้อมูลเส้นทางไม่สำเร็จ";
        alert(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleOpenCreateModal = () => {
    setFormData({ routeName: "", stationsInput: "" });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({ routeName: "", stationsInput: "" });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const routeName = formData.routeName.trim();
    if (!routeName) {
      alert("กรุณากรอกชื่อเส้นทาง");
      return;
    }

    const stations = formData.stationsInput
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((stationName, index) => ({
        stationName,
        stopOrder: index + 1,
      }));

    try {
      await apiRequest("/api/routes", {
        method: "POST",
        body: JSON.stringify({
          routeName,
          stations,
        }),
      });
      await loadRoutes();
      handleCloseCreateModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เพิ่มเส้นทางไม่สำเร็จ";
      alert(message);
    }
  };

  const handleEditClick = (route: RouteData) => {
    setSelectedRoute(route);
    setEditFormData({
      routeName: route.routeName,
      stationsInput: route.stations.map((s) => s.stationName).join(", "),
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoute(null);
    setEditFormData({ routeName: "", stationsInput: "" });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    const routeName = editFormData.routeName.trim();
    if (!routeName) {
      alert("กรุณากรอกชื่อเส้นทาง");
      return;
    }

    const stations = editFormData.stationsInput
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((stationName, index) => ({
        stationName,
        stopOrder: index + 1,
      }));

    try {
      await apiRequest(`/api/routes/${selectedRoute.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          routeName,
          stations,
        }),
      });
      await loadRoutes();
      handleCloseEditModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "แก้ไขเส้นทางไม่สำเร็จ";
      alert(message);
    }
  };

  const handleDeleteClick = (route: RouteData) => {
    setSelectedRoute(route);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRoute(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoute) return;

    try {
      await apiRequest(`/api/routes/${selectedRoute.id}`, {
        method: "DELETE",
      });
      await loadRoutes();
      handleCloseDeleteModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบเส้นทางไม่สำเร็จ";
      alert(message);
    }
  };

  const filteredRoutes = routes.filter((route) =>
    route.routeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการเส้นทาง"
          breadcrumbs={["หน้าหลัก", "จัดการเส้นทาง"]}
        />
        <main className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาเส้นทาง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
              <Plus size={20} />
              <span>เพิ่มเส้นทาง</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="flex cursor-pointer flex-col gap-4 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  onClick={() =>
                    setExpandedRoute(
                      expandedRoute === route.id ? null : route.id,
                    )
                  }>
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MapPinned size={24} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-900">
                        {route.routeName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {route.stations.length} จุดจอด
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(route);
                      }}>
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteClick(route);
                      }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {expandedRoute === route.id && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        จุดจอดตามลำดับ:
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {route.stations.map((station, index) => (
                          <div
                            key={station.id}
                            className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                              <MapPin size={16} className="text-blue-500" />
                              <span className="text-sm text-gray-700">
                                {station.stationName}
                              </span>
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseEditModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                แก้ไขเส้นทาง
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อเส้นทาง
                </label>
                <input
                  type="text"
                  value={editFormData.routeName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      routeName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น กรุงเทพ - โคราช"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดจอด (คั่นด้วยเครื่องหมาย ,)
                </label>
                <textarea
                  value={editFormData.stationsInput}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      stationsInput: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="เช่น โคราช, ปากช่อง, กรุงเทพ"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  ระบุชื่อจุดจอดคั่นด้วยเครื่องหมายลูกน้ำ จะเรียงลำดับตามที่ระบุ
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseDeleteModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                คุณต้องการลบเส้นทางนี้?
              </h3>
              <p className="text-gray-500 mb-6">{selectedRoute?.routeName}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmDelete()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  ลบเส้นทาง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                เพิ่มเส้นทางใหม่
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
                  ชื่อเส้นทาง
                </label>
                <input
                  type="text"
                  value={formData.routeName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      routeName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น กรุงเทพ - โคราช"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  จุดจอด (คั่นด้วยเครื่องหมาย ,)
                </label>
                <textarea
                  value={formData.stationsInput}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stationsInput: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="เช่น โคราช, ปากช่อง, กรุงเทพ"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  ระบุชื่อจุดจอดคั่นด้วยเครื่องหมายลูกน้ำ จะเรียงลำดับตามที่ระบุ
                </p>
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
