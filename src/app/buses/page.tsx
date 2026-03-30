"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  Bus,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  LayoutGrid,
  X,
  Eye,
  Save,
  Grid3X3,
} from "lucide-react";

// Types for seat layout
type SeatType =
  | "available"
  | "booked"
  | "blocked"
  | "driver"
  | "door"
  | "aisle";

interface SeatLayout {
  totalRows: number;
  seatsPerRow: number;
  aisleAfter: number; // After which seat number is the aisle (e.g., 2 means seats 1,2 | aisle | 3,4)
  totalSeats: number;
  hasBackRow: boolean; // Extra seats at the back
  backRowSeats: number;
}

interface BusData {
  id: number;
  busNumber: string;
  totalSeats: number;
  type: string;
  status: "active" | "maintenance";
  layout: SeatLayout;
}

// Generate seat layout preview data
const generateSeats = (
  layout: SeatLayout,
): { id: string; type: SeatType; label: string }[][] => {
  const rows: { id: string; type: SeatType; label: string }[][] = [];

  // Driver row
  rows.push([
    { id: "driver", type: "driver", label: "คนขับ" },
    { id: "door", type: "door", label: "ทางเข้า" },
    ...Array(layout.seatsPerRow - 2)
      .fill(null)
      .map((_, i) => ({
        id: `aisle-top-${i}`,
        type: "aisle" as SeatType,
        label: "",
      })),
  ]);

  // Regular seats
  for (let row = 1; row <= layout.totalRows; row++) {
    const rowSeats: { id: string; type: SeatType; label: string }[] = [];
    let seatNum = (row - 1) * (layout.seatsPerRow - 1) + 1;

    for (let col = 1; col <= layout.seatsPerRow; col++) {
      if (col === layout.aisleAfter + 1) {
        rowSeats.push({ id: `aisle-${row}-${col}`, type: "aisle", label: "" });
      } else {
        const colLabel =
          col <= layout.aisleAfter
            ? String.fromCharCode(65 + col - 1) // A, B, C...
            : String.fromCharCode(65 + col - 2); // Skip aisle letter
        rowSeats.push({
          id: `seat-${row}-${col}`,
          type: "available",
          label: `${colLabel}${row}`,
        });
        seatNum++;
      }
    }
    rows.push(rowSeats);
  }

  // Back row if enabled
  if (layout.hasBackRow && layout.backRowSeats > 0) {
    const backRow: { id: string; type: SeatType; label: string }[] = [];
    const startNum = layout.totalRows * (layout.seatsPerRow - 1) + 1;

    for (let i = 0; i < layout.backRowSeats; i++) {
      if (
        i === Math.floor(layout.backRowSeats / 2) &&
        layout.backRowSeats >= 4
      ) {
        backRow.push({ id: `aisle-back`, type: "aisle", label: "" });
      }
      backRow.push({
        id: `seat-back-${i}`,
        type: "available",
        label: `${String.fromCharCode(65 + i)}${layout.totalRows + 1}`,
      });
    }
    rows.push(backRow);
  }

  return rows;
};

const mockBuses: BusData[] = [
  {
    id: 1,
    busNumber: "815-1",
    totalSeats: 40,
    type: "มาตรฐาน",
    status: "active",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 2,
    busNumber: "815-2",
    totalSeats: 40,
    type: "มาตรฐาน",
    status: "active",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 3,
    busNumber: "VIP-01",
    totalSeats: 32,
    type: "VIP",
    status: "active",
    layout: {
      totalRows: 8,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 32,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 4,
    busNumber: "VIP-02",
    totalSeats: 32,
    type: "VIP",
    status: "maintenance",
    layout: {
      totalRows: 8,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 32,
      hasBackRow: false,
      backRowSeats: 0,
    },
  },
  {
    id: 5,
    busNumber: "815-3",
    totalSeats: 44,
    type: "มาตรฐาน",
    status: "active",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: true,
      backRowSeats: 4,
    },
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
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
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

// Seat Layout Preview Component
function SeatLayoutPreview({ layout }: { layout: SeatLayout }) {
  const seats = generateSeats(layout);

  return (
    <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto">
      <div className="min-w-[300px] max-w-[500px] mx-auto">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-blue-500 rounded-lg" />
            <span>ที่นั่งว่าง</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-800 rounded-lg" />
            <span>คนขับ</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-400 rounded" />
            <span>ทางเดิน</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-2">
          {seats.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-1">
              {row.map((seat, colIndex) => {
                if (seat.type === "aisle") {
                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="w-8 h-10" />
                  );
                }
                if (seat.type === "driver") {
                  return (
                    <div
                      key={seat.id}
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white text-xs">
                      🚌
                    </div>
                  );
                }
                if (seat.type === "door") {
                  return (
                    <div
                      key={seat.id}
                      className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs">
                      🚪
                    </div>
                  );
                }
                return (
                  <div
                    key={seat.id}
                    className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-colors shadow-sm"
                    title={`ที่นั่ง ${seat.label}`}>
                    {seat.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {layout.totalSeats}
            </p>
            <p className="text-sm text-gray-500">ที่นั่งทั้งหมด</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">
              {layout.totalRows}
            </p>
            <p className="text-sm text-gray-500">จำนวนแถว</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [buses, setBuses] = useState<BusData[]>(mockBuses);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<BusData>>({
    busNumber: "",
    type: "มาตรฐาน",
    status: "active",
    layout: {
      totalRows: 10,
      seatsPerRow: 4,
      aisleAfter: 2,
      totalSeats: 40,
      hasBackRow: false,
      backRowSeats: 0,
    },
  });

  const filteredBuses = buses.filter(
    (bus) =>
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleViewLayout = (bus: BusData) => {
    setSelectedBus(bus);
    setIsViewModalOpen(true);
  };

  const handleEdit = (bus: BusData) => {
    setSelectedBus(bus);
    setFormData(bus);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      busNumber: "",
      type: "มาตรฐาน",
      status: "active",
      layout: {
        totalRows: 10,
        seatsPerRow: 4,
        aisleAfter: 2,
        totalSeats: 40,
        hasBackRow: false,
        backRowSeats: 0,
      },
    });
    setIsAddModalOpen(true);
  };

  const calculateTotalSeats = (layout: SeatLayout): number => {
    const regularSeats = layout.totalRows * (layout.seatsPerRow - 1);
    const backSeats = layout.hasBackRow ? layout.backRowSeats : 0;
    return regularSeats + backSeats;
  };

  const updateLayoutField = (
    field: keyof SeatLayout,
    value: number | boolean,
  ) => {
    setFormData((prev) => {
      const newLayout = { ...prev.layout!, [field]: value };
      // Auto-calculate total seats
      if (field !== "totalSeats") {
        newLayout.totalSeats = calculateTotalSeats(newLayout as SeatLayout);
      }
      return { ...prev, layout: newLayout };
    });
  };

  const handleSave = () => {
    if (isAddModalOpen) {
      const newBus: BusData = {
        id: Math.max(...buses.map((b) => b.id)) + 1,
        busNumber: formData.busNumber || "",
        type: formData.type || "มาตรฐาน",
        status: formData.status || "active",
        totalSeats: formData.layout?.totalSeats || 40,
        layout: formData.layout as SeatLayout,
      };
      setBuses([...buses, newBus]);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && selectedBus) {
      setBuses(
        buses.map((bus) =>
          bus.id === selectedBus.id
            ? {
                ...bus,
                ...formData,
                totalSeats: formData.layout?.totalSeats || bus.totalSeats,
              }
            : bus,
        ),
      );
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (busId: number) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบรถคันนี้?")) {
      setBuses(buses.filter((b) => b.id !== busId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header
          title="จัดการรถบัส"
          breadcrumbs={["หน้าหลัก", "จัดการรถบัส"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 sm:p-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหารถบัส..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto">
              <Plus size={20} />
              <span>เพิ่มรถบัส</span>
            </button>
          </div>

          {/* Buses Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Bus size={24} className="text-blue-600" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewLayout(bus)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="ดูผังที่นั่ง">
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(bus)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไข">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(bus.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบ">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {bus.busNumber}
                </h3>
                <p className="text-sm text-gray-500">{bus.type}</p>

                {/* Mini Seat Layout Preview */}
                <div className="mt-3 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {generateSeats(bus.layout)
                      .slice(0, 4)
                      .map((row, idx) => (
                        <div key={idx} className="flex gap-0.5">
                          {row
                            .filter((s) => s.type === "available")
                            .slice(0, 4)
                            .map((seat, sidx) => (
                              <div
                                key={sidx}
                                className="w-4 h-4 bg-blue-400 rounded-sm"
                                title={seat.label}
                              />
                            ))}
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    {bus.layout.totalRows} แถว × {bus.layout.seatsPerRow - 1}{" "}
                    ที่นั่ง/แถว {bus.layout.hasBackRow && "+ แถวหลัง"}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{bus.totalSeats} ที่นั่ง</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      bus.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {bus.status === "active" ? "พร้อมใช้งาน" : "ซ่อมบำรุง"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* View Layout Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`ผังที่นั่งรถ ${selectedBus?.busNumber}`}
        size="lg">
        {selectedBus && (
          <div>
            <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-100 px-3 py-1 rounded-full">
                {selectedBus.type}
              </span>
              <span>{selectedBus.totalSeats} ที่นั่ง</span>
              <span>{selectedBus.layout.totalRows} แถว</span>
              <span>
                ทางเดินระหว่าง {selectedBus.layout.aisleAfter} -{" "}
                {selectedBus.layout.aisleAfter + 1}
              </span>
            </div>
            <SeatLayoutPreview layout={selectedBus.layout} />
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={
          isAddModalOpen
            ? "เพิ่มรถบัสใหม่"
            : `แก้ไขรถบัส ${selectedBus?.busNumber}`
        }
        size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเลขรถ
              </label>
              <input
                type="text"
                value={formData.busNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, busNumber: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 815-1, VIP-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทรถ
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="มาตรฐาน">มาตรฐาน</option>
                <option value="VIP">VIP</option>
                <option value="มินิบัส">มินิบัส</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "maintenance",
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">พร้อมใช้งาน</option>
                <option value="maintenance">ซ่อมบำรุง</option>
              </select>
            </div>

            <hr className="border-gray-200" />

            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Grid3X3 size={18} />
              ตั้งค่าผังที่นั่ง
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนแถว
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.layout?.totalRows}
                  onChange={(e) =>
                    updateLayoutField(
                      "totalRows",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่นั่งต่อแถว
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={formData.layout?.seatsPerRow}
                  onChange={(e) =>
                    updateLayoutField(
                      "seatsPerRow",
                      parseInt(e.target.value) || 2,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ทางเดินอยู่ระหว่างที่นั่ง (หมายเลข)
              </label>
              <input
                type="number"
                min={1}
                max={(formData.layout?.seatsPerRow || 4) - 1}
                value={formData.layout?.aisleAfter}
                onChange={(e) =>
                  updateLayoutField("aisleAfter", parseInt(e.target.value) || 1)
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                เช่น ค่า 2 หมายถึง ทางเดินอยู่ระหว่างที่นั่ง 2 และ 3
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasBackRow"
                checked={formData.layout?.hasBackRow}
                onChange={(e) =>
                  updateLayoutField("hasBackRow", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="hasBackRow"
                className="text-sm font-medium text-gray-700">
                มีแถวที่นั่งพิเศษด้านหลัง
              </label>
            </div>

            {formData.layout?.hasBackRow && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนที่นั่งแถวหลัง
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.layout?.backRowSeats}
                  onChange={(e) =>
                    updateLayoutField(
                      "backRowSeats",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  ที่นั่งทั้งหมด
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.layout?.totalSeats}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              <Save size={20} />
              <span>
                {isAddModalOpen ? "เพิ่มรถบัส" : "บันทึกการเปลี่ยนแปลง"}
              </span>
            </button>
          </div>

          {/* Right: Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ตัวอย่างผังที่นั่ง
            </label>
            {formData.layout && <SeatLayoutPreview layout={formData.layout} />}
          </div>
        </div>
      </Modal>
    </div>
  );
}
