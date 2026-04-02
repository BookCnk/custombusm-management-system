"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  LayoutGrid,
  MapPin,
  MapPinned,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import CustomSelect from "../components/CustomSelect";
import { apiRequest } from "@/lib/api-client";
import {
  mapBooking,
  mapBus,
  mapRoute,
  mapSchedule,
  toDateInputValue,
  type BookingData,
  type BusData,
  type RouteData,
  type ScheduleData,
} from "@/lib/bus-management";

type ScheduleDetail = ScheduleData & {
  detailedBookings: BookingData[];
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function mapScheduleDetail(raw: unknown): ScheduleDetail {
  const schedule = mapSchedule(raw);
  const rawRecord = typeof raw === "object" && raw !== null ? raw : null;
  const detailedBookings =
    rawRecord && "bookings" in rawRecord && Array.isArray(rawRecord.bookings)
      ? rawRecord.bookings.map((booking: unknown) => mapBooking(booking))
      : [];

  return {
    ...schedule,
    detailedBookings,
    bookingsCount: detailedBookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length,
  };
}

export default function SchedulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(new Date().toISOString()),
  );
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [filterBus, setFilterBus] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(
    null,
  );
  const [viewScheduleDetail, setViewScheduleDetail] =
    useState<ScheduleDetail | null>(null);
  const [formData, setFormData] = useState({
    busId: "",
    routeId: "",
    departureDate: "",
    departureTime: "",
  });

  const loadSchedules = async (date: string) => {
    const data = await apiRequest<unknown[]>(
      `/api/schedules?date=${encodeURIComponent(date)}`,
    );
    setSchedules(data.map((item) => mapSchedule(item)));
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const [busData, routeData] = await Promise.all([
          apiRequest<unknown[]>("/api/buses"),
          apiRequest<unknown[]>("/api/routes"),
        ]);

        if (cancelled) {
          return;
        }

        setBuses(busData.map((item) => mapBus(item)));
        setRoutes(routeData.map((item) => mapRoute(item)));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดข้อมูลอ้างอิงไม่สำเร็จ";
        alert(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<unknown[]>(
          `/api/schedules?date=${encodeURIComponent(selectedDate)}`,
        );

        if (cancelled) {
          return;
        }

        setSchedules(data.map((item) => mapSchedule(item)));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดตารางเดินรถไม่สำเร็จ";
        alert(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const filteredSchedules = schedules.filter(
    (schedule) =>
      (filterBus === "" || schedule.busId.toString() === filterBus) &&
      (filterRoute === "" || schedule.routeId.toString() === filterRoute) &&
      (schedule.route.routeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        schedule.bus.busNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

  const handleCreate = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    setFormData({
      busId: "",
      routeId: "",
      departureDate: selectedDate,
      departureTime: currentTime,
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);
    setFormData({
      busId: schedule.busId.toString(),
      routeId: schedule.routeId.toString(),
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleView = async (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);
    setViewScheduleDetail(null);
    setIsViewModalOpen(true);

    try {
      const data = await apiRequest<unknown>(`/api/schedules/${schedule.id}`);
      setViewScheduleDetail(mapScheduleDetail(data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "โหลดรายละเอียดรอบรถไม่สำเร็จ";
      alert(message);
      setIsViewModalOpen(false);
    }
  };

  const closeFormModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
    setFormData({
      busId: "",
      routeId: "",
      departureDate: "",
      departureTime: "",
    });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiRequest("/api/schedules", {
        method: "POST",
        body: JSON.stringify({
          busId: Number(formData.busId),
          routeId: Number(formData.routeId),
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
        }),
      });
      closeFormModal();
      await loadSchedules(selectedDate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เพิ่มรอบรถไม่สำเร็จ";
      alert(message);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule) {
      return;
    }

    try {
      await apiRequest(`/api/schedules/${selectedSchedule.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          busId: Number(formData.busId),
          routeId: Number(formData.routeId),
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
        }),
      });
      closeFormModal();
      await loadSchedules(selectedDate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "แก้ไขรอบรถไม่สำเร็จ";
      alert(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) {
      return;
    }

    try {
      await apiRequest(`/api/schedules/${selectedSchedule.id}`, {
        method: "DELETE",
      });
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
      await loadSchedules(selectedDate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบรอบรถไม่สำเร็จ";
      alert(message);
    }
  };

  const handleDuplicate = async (schedule: ScheduleData) => {
    try {
      await apiRequest("/api/schedules", {
        method: "POST",
        body: JSON.stringify({
          busId: schedule.busId,
          routeId: schedule.routeId,
          departureDate: selectedDate,
          departureTime: schedule.departureTime,
        }),
      });
      await loadSchedules(selectedDate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "คัดลอกรอบรถไม่สำเร็จ";
      alert(message);
    }
  };

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

  const scheduleForView = viewScheduleDetail || selectedSchedule;
  const bookingRows = viewScheduleDetail?.detailedBookings || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 min-w-0">
        <Header title="ตารางเดินรถ" breadcrumbs={["หน้าหลัก", "ตารางเดินรถ"]} />
        <main className="p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={prevDate}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500">วันที่เดินรถ</p>
              <p className="text-sm font-semibold text-gray-900 sm:text-lg">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">รอบรถทั้งหมด</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredSchedules.length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">ที่นั่งรวม</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredSchedules.reduce(
                  (sum, s) => sum + s.bus.totalSeats,
                  0,
                )}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">จองแล้ว</p>
              <p className="text-xl font-bold text-blue-600">
                {filteredSchedules.reduce((sum, s) => sum + s.bookingsCount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">ว่าง</p>
              <p className="text-xl font-bold text-green-600">
                {filteredSchedules.reduce(
                  (sum, s) => sum + (s.bus.totalSeats - s.bookingsCount),
                  0,
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="ค้นหารอบรถ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
              />
              <CustomSelect
                value={filterBus}
                onChange={(value) => setFilterBus(value.toString())}
                options={[
                  { value: "", label: "ทุกรถบัส" },
                  ...buses.map((bus) => ({
                    value: bus.id.toString(),
                    label: `${bus.busNumber} (${bus.type})`,
                  })),
                ]}
              />
              <CustomSelect
                value={filterRoute}
                onChange={(value) => setFilterRoute(value.toString())}
                options={[
                  { value: "", label: "ทุกเส้นทาง" },
                  ...routes.map((route) => ({
                    value: route.id.toString(),
                    label: route.routeName,
                  })),
                ]}
              />
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus size={18} />
              <span className="hidden sm:inline">เพิ่มรอบรถ</span>
              <span className="sm:hidden">เพิ่ม</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSchedules.map((schedule) => {
              const occupancyRate =
                schedule.bus.totalSeats > 0
                  ? (schedule.bookingsCount / schedule.bus.totalSeats) * 100
                  : 0;
              const isFull = schedule.bookingsCount >= schedule.bus.totalSeats;

              return (
                <div
                  key={schedule.id}
                  onClick={() => void handleView(schedule)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${isFull ? "bg-red-100" : "bg-blue-100"}`}>
                        <Bus
                          size={18}
                          className={isFull ? "text-red-600" : "text-blue-600"}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {schedule.bus.busNumber}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {schedule.bus.totalSeats} ที่นั่ง
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(schedule);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDuplicate(schedule);
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="คัดลอกรอบรถ">
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(schedule);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPinned size={16} className="text-gray-400 shrink-0" />
                      <span className="text-sm truncate">
                        {schedule.route.routeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} className="text-gray-400 shrink-0" />
                      <span className="text-sm font-medium">
                        {schedule.departureTime} น.
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Users size={14} />
                        <span className="hidden sm:inline">จองแล้ว</span>
                        <span className="sm:hidden">จอง</span>
                        <span
                          className={isFull ? "text-red-600 font-medium" : ""}>
                          {schedule.bookingsCount}/{schedule.bus.totalSeats}
                        </span>
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
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyRate >= 80
                            ? "bg-red-500"
                            : occupancyRate >= 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchedules.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">ไม่พบรอบรถในวันที่เลือก</p>
              <button
                onClick={handleCreate}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                + เพิ่มรอบรถใหม่
              </button>
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={closeFormModal}
        title={isCreateModalOpen ? "เพิ่มรอบรถใหม่" : "แก้ไขรอบรถ"}
        size="md">
        <form
          onSubmit={isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit}
          className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เลือกรถบัส
            </label>
            <CustomSelect
              value={formData.busId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, busId: value.toString() }))
              }
              options={[
                { value: "", label: "-- เลือกรถบัส --" },
                ...buses.map((bus) => ({
                  value: bus.id.toString(),
                  label: `${bus.busNumber} (${bus.type}) - ${bus.totalSeats} ที่นั่ง`,
                })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เลือกเส้นทาง
            </label>
            <CustomSelect
              value={formData.routeId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, routeId: value.toString() }))
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                วันที่ออกเดินทาง
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    departureDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เวลาออกเดินทาง
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  placeholder="ชั่วโมง"
                  value={formData.departureTime?.split(":")[0] || ""}
                  onChange={(e) => {
                    const hours = e.target.value.padStart(2, "0");
                    const minutes =
                      formData.departureTime?.split(":")[1] || "00";
                    setFormData((prev) => ({
                      ...prev,
                      departureTime: `${hours}:${minutes}`,
                    }));
                  }}
                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-gray-400 font-bold">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="นาที"
                  value={formData.departureTime?.split(":")[1] || ""}
                  onChange={(e) => {
                    const hours = formData.departureTime?.split(":")[0] || "00";
                    const minutes = e.target.value.padStart(2, "0");
                    setFormData((prev) => ({
                      ...prev,
                      departureTime: `${hours}:${minutes}`,
                    }));
                  }}
                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="text-sm text-gray-500">น.</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeFormModal}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {isCreateModalOpen ? "บันทึก" : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="ยืนยันการลบ"
        size="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            คุณต้องการลบรอบรถนี้?
          </h4>
          <p className="text-gray-500 mb-6">
            {selectedSchedule && (
              <>
                รถ {selectedSchedule.bus.busNumber} เส้นทาง{" "}
                {selectedSchedule.route.routeName}
                <br />
                วันที่ {selectedSchedule.departureDate} เวลา{" "}
                {selectedSchedule.departureTime} น.
              </>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              ยกเลิก
            </button>
            <button
              onClick={() => void handleConfirmDelete()}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              ลบรอบรถ
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewScheduleDetail(null);
        }}
        title="รายละเอียดรอบรถ"
        size="lg">
        {scheduleForView && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bus size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">รถบัส</p>
                    <p className="font-medium text-gray-900">
                      {scheduleForView.bus.busNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {scheduleForView.bus.totalSeats} ที่นั่ง
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPinned size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">เส้นทาง</p>
                    <p className="font-medium text-gray-900">
                      {scheduleForView.route.routeName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarDays size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">วันที่</p>
                    <p className="font-medium text-gray-900">
                      {new Date(
                        scheduleForView.departureDate,
                      ).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">เวลาออกเดินทาง</p>
                    <p className="font-medium text-gray-900">
                      {scheduleForView.departureTime} น.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users size={16} />
                    จองแล้ว {scheduleForView.bookingsCount}/
                    {scheduleForView.bus.totalSeats} ที่นั่ง
                  </span>
                  <span
                    className={`font-medium ${
                      scheduleForView.bus.totalSeats > 0 &&
                      (scheduleForView.bookingsCount /
                        scheduleForView.bus.totalSeats) *
                        100 >=
                        80
                        ? "text-red-600"
                        : "text-green-600"
                    }`}>
                    {scheduleForView.bus.totalSeats > 0
                      ? (
                          (scheduleForView.bookingsCount /
                            scheduleForView.bus.totalSeats) *
                          100
                        ).toFixed(0)
                      : "0"}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${scheduleForView.bus.totalSeats > 0 ? (scheduleForView.bookingsCount / scheduleForView.bus.totalSeats) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} />
                รายชื่อผู้โดยสาร ({bookingRows.length} คน)
              </h4>
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full px-4 sm:px-6">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ผู้โดยสาร
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ที่นั่ง
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          ขึ้นรถ
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          ลงรถ
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          ราคา
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookingRows.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {booking.passengerName || "-"}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone size={12} />
                                {booking.passengerPhone || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                              {booking.seatNumber}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={14} className="text-gray-400" />
                              {booking.pickupStation?.stationName || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={14} className="text-gray-400" />
                              {booking.dropoffStation?.stationName || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="font-medium text-gray-900">
                              ฿{booking.price}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookingRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-6 text-center text-sm text-gray-500">
                            ยังไม่มีผู้โดยสารในรอบนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  if (selectedSchedule) {
                    handleEdit(selectedSchedule);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Edit size={18} />
                แก้ไขรอบรถ
              </button>
              <button
                onClick={() => {
                  window.location.href = "/bookings";
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                <LayoutGrid size={18} />
                ดูผังที่นั่ง
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                ปิด
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
