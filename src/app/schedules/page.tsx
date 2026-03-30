"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  CalendarDays,
  Plus,
  Search,
  Edit,
  Trash2,
  Bus,
  MapPinned,
  Users,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  User,
  AlertTriangle,
} from "lucide-react";

// Mock Data
const mockBuses = [
  { id: 1, busNumber: "815-1", totalSeats: 40, type: "มาตรฐาน" },
  { id: 2, busNumber: "815-2", totalSeats: 40, type: "มาตรฐาน" },
  { id: 3, busNumber: "VIP-01", totalSeats: 32, type: "VIP" },
  { id: 4, busNumber: "VIP-02", totalSeats: 32, type: "VIP" },
  { id: 5, busNumber: "815-3", totalSeats: 40, type: "มาตรฐาน" },
];

const mockRoutes = [
  { id: 1, routeName: "ราชสีมา - ระยอง" },
  { id: 2, routeName: "โคราช - กรุงเทพ" },
  { id: 3, routeName: "ราชสีมา - ขอนแก่น" },
];

const mockSchedules = [
  {
    id: 1,
    busId: 1,
    routeId: 1,
    bus: { busNumber: "815-1", totalSeats: 40 },
    route: { routeName: "ราชสีมา - ระยอง" },
    departureDate: "2026-03-31",
    departureTime: "08:30",
    bookingsCount: 35,
  },
  {
    id: 2,
    busId: 4,
    routeId: 2,
    bus: { busNumber: "VIP-02", totalSeats: 32 },
    route: { routeName: "โคราช - กรุงเทพ" },
    departureDate: "2026-03-31",
    departureTime: "10:00",
    bookingsCount: 28,
  },
  {
    id: 3,
    busId: 5,
    routeId: 1,
    bus: { busNumber: "815-3", totalSeats: 40 },
    route: { routeName: "ราชสีมา - ระยอง" },
    departureDate: "2026-03-31",
    departureTime: "14:30",
    bookingsCount: 12,
  },
  {
    id: 4,
    busId: 2,
    routeId: 3,
    bus: { busNumber: "815-2", totalSeats: 40 },
    route: { routeName: "ราชสีมา - ขอนแก่น" },
    departureDate: "2026-04-01",
    departureTime: "09:00",
    bookingsCount: 0,
  },
  {
    id: 5,
    busId: 3,
    routeId: 2,
    bus: { busNumber: "VIP-01", totalSeats: 32 },
    route: { routeName: "โคราช - กรุงเทพ" },
    departureDate: "2026-04-01",
    departureTime: "13:00",
    bookingsCount: 5,
  },
];

const mockBookings = [
  {
    id: 1,
    passengerName: "สมชาย ใจดี",
    phone: "081-234-5678",
    seatNumber: "A12",
    pickup: "ปักธงชัย",
    dropoff: "ระยอง",
    price: 350,
    status: "CONFIRMED",
  },
  {
    id: 2,
    passengerName: "สมหญิง รักเรียน",
    phone: "089-876-5432",
    seatNumber: "B05",
    pickup: "โคราช",
    dropoff: "กรุงเทพ",
    price: 420,
    status: "CONFIRMED",
  },
  {
    id: 3,
    passengerName: "ประเสริฐ มากมี",
    phone: "086-123-4567",
    seatNumber: "A03",
    pickup: "กบินทร์บุรี",
    dropoff: "บ่อวิน",
    price: 200,
    status: "CONFIRMED",
  },
  {
    id: 4,
    passengerName: "มานี มานะ",
    phone: "090-987-6543",
    seatNumber: "C08",
    pickup: "โคราช",
    dropoff: "ระยอง",
    price: 350,
    status: "CONFIRMED",
  },
];

// Modal Component
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

export default function SchedulesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-03-31");
  const [schedules, setSchedules] = useState(mockSchedules);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    (typeof mockSchedules)[0] | null
  >(null);

  // Form State
  const [formData, setFormData] = useState({
    busId: "",
    routeId: "",
    departureDate: "",
    departureTime: "",
  });

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.departureDate === selectedDate &&
      (schedule.route.routeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        schedule.bus.busNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

  const handleCreate = () => {
    setFormData({
      busId: "",
      routeId: "",
      departureDate: selectedDate,
      departureTime: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (schedule: (typeof mockSchedules)[0]) => {
    setSelectedSchedule(schedule);
    setFormData({
      busId: schedule.busId.toString(),
      routeId: schedule.routeId.toString(),
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (schedule: (typeof mockSchedules)[0]) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleView = (schedule: (typeof mockSchedules)[0]) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const bus = mockBuses.find((b) => b.id === parseInt(formData.busId));
    const route = mockRoutes.find((r) => r.id === parseInt(formData.routeId));
    if (bus && route) {
      const newSchedule = {
        id: schedules.length + 1,
        busId: parseInt(formData.busId),
        routeId: parseInt(formData.routeId),
        bus: { busNumber: bus.busNumber, totalSeats: bus.totalSeats },
        route: { routeName: route.routeName },
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        bookingsCount: 0,
      };
      setSchedules([...schedules, newSchedule]);
      setIsCreateModalOpen(false);
    }
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const bus = mockBuses.find((b) => b.id === parseInt(formData.busId));
    const route = mockRoutes.find((r) => r.id === parseInt(formData.routeId));
    if (bus && route && selectedSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                busId: parseInt(formData.busId),
                routeId: parseInt(formData.routeId),
                bus: { busNumber: bus.busNumber, totalSeats: bus.totalSeats },
                route: { routeName: route.routeName },
                departureDate: formData.departureDate,
                departureTime: formData.departureTime,
              }
            : s,
        ),
      );
      setIsEditModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedSchedule) {
      setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id));
      setIsDeleteModalOpen(false);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 transition-all duration-300 min-w-0">
        <Header
          title="ตารางเดินรถ"
          breadcrumbs={["หน้าหลัก", "ตารางเดินรถ"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6">
          {/* Date Navigation */}
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

          {/* Stats Summary */}
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

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
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
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
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

          {/* Schedules Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSchedules.map((schedule) => {
              const occupancyRate =
                (schedule.bookingsCount / schedule.bus.totalSeats) * 100;
              const isFull = schedule.bookingsCount >= schedule.bus.totalSeats;
              return (
                <div
                  key={schedule.id}
                  onClick={() => handleView(schedule)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isCreateModalOpen ? "เพิ่มรอบรถใหม่" : "แก้ไขรอบรถ"}
        size="md">
        <form
          onSubmit={isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit}
          className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เลือกรถบัส
            </label>
            <select
              value={formData.busId}
              onChange={(e) =>
                setFormData({ ...formData, busId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required>
              <option value="">-- เลือกรถบัส --</option>
              {mockBuses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.busNumber} ({bus.type}) - {bus.totalSeats} ที่นั่ง
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เลือกเส้นทาง
            </label>
            <select
              value={formData.routeId}
              onChange={(e) =>
                setFormData({ ...formData, routeId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required>
              <option value="">-- เลือกเส้นทาง --</option>
              {mockRoutes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName}
                </option>
              ))}
            </select>
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
                  setFormData({ ...formData, departureDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เวลาออกเดินทาง
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) =>
                  setFormData({ ...formData, departureTime: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
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

      {/* Delete Confirmation Modal */}
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
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              ลบรอบรถ
            </button>
          </div>
        </div>
      </Modal>

      {/* View Schedule Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="รายละเอียดรอบรถ"
        size="lg">
        {selectedSchedule && (
          <div className="space-y-6">
            {/* Schedule Info */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bus size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">รถบัส</p>
                    <p className="font-medium text-gray-900">
                      {selectedSchedule.bus.busNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedSchedule.bus.totalSeats} ที่นั่ง
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
                      {selectedSchedule.route.routeName}
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
                        selectedSchedule.departureDate,
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
                    <p className="text-xs text-gray-500">เวลาออก</p>
                    <p className="font-medium text-gray-900">
                      {selectedSchedule.departureTime} น.
                    </p>
                  </div>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users size={16} />
                    จองแล้ว {selectedSchedule.bookingsCount}/
                    {selectedSchedule.bus.totalSeats} ที่นั่ง
                  </span>
                  <span
                    className={`font-medium ${
                      (selectedSchedule.bookingsCount /
                        selectedSchedule.bus.totalSeats) *
                        100 >=
                      80
                        ? "text-red-600"
                        : "text-green-600"
                    }`}>
                    {(
                      (selectedSchedule.bookingsCount /
                        selectedSchedule.bus.totalSeats) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(selectedSchedule.bookingsCount / selectedSchedule.bus.totalSeats) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} />
                รายชื่อผู้โดยสาร ({mockBookings.length} คน)
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
                      {mockBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {booking.passengerName}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone size={12} />
                                {booking.phone}
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
                              {booking.pickup}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={14} className="text-gray-400" />
                              {booking.dropoff}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="font-medium text-gray-900">
                              ฿{booking.price}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedSchedule);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Edit size={18} />
                แก้ไขรอบรถ
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
