"use client";

import { useEffect, useState } from "react";
import {
  Bus,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  LayoutGrid,
  X,
  Save,
  Grid3X3,
  Copy,
} from "lucide-react";

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import CustomSelect from "../components/CustomSelect";
import { apiRequest } from "@/lib/api-client";
import {
  createDefaultSeatLayout,
  mapBus,
  type BusData,
  type SeatLayout,
} from "@/lib/bus-management";

type SeatType =
  | "available"
  | "booked"
  | "blocked"
  | "driver"
  | "door"
  | "aisle";

type SeatPreviewItem = {
  id: string;
  type: SeatType;
  label: string;
  originalLabel: string;
};

const defaultBusType = "มาตรฐาน";

function createInitialFormData(): Partial<BusData> {
  return {
    busNumber: "",
    type: defaultBusType,
    status: "active",
    totalSeats: 40,
    layout: createDefaultSeatLayout(40),
  };
}

function generateSeats(layout: SeatLayout): SeatPreviewItem[][] {
  const rows: SeatPreviewItem[][] = [];
  const customLabels = layout.customSeatLabels || {};

  rows.push([
    { id: "driver", type: "driver", label: "คนขับ", originalLabel: "คนขับ" },
    { id: "door", type: "door", label: "ทางเข้า", originalLabel: "ทางเข้า" },
    ...Array(Math.max(layout.seatsPerRow - 2, 0))
      .fill(null)
      .map((_, i) => ({
        id: `aisle-top-${i}`,
        type: "aisle" as SeatType,
        label: "",
        originalLabel: "",
      })),
  ]);

  for (let row = 1; row <= layout.totalRows; row++) {
    const rowSeats: SeatPreviewItem[] = [];

    for (let col = 1; col <= layout.seatsPerRow; col++) {
      if (col === layout.aisleAfter + 1) {
        rowSeats.push({
          id: `aisle-${row}-${col}`,
          type: "aisle",
          label: "",
          originalLabel: "",
        });
        continue;
      }

      const colLabel =
        col <= layout.aisleAfter
          ? String.fromCharCode(65 + col - 1)
          : String.fromCharCode(65 + col - 2);
      const originalLabel = `${colLabel}${row}`;
      const customLabel = customLabels[originalLabel];

      rowSeats.push({
        id: `seat-${row}-${col}`,
        type: "available",
        label: customLabel || originalLabel,
        originalLabel,
      });
    }

    rows.push(rowSeats);
  }

  if (layout.hasBackRow && layout.backRowSeats > 0) {
    const backRow: SeatPreviewItem[] = [];

    for (let i = 0; i < layout.backRowSeats; i++) {
      if (
        i === Math.floor(layout.backRowSeats / 2) &&
        layout.backRowSeats >= 4
      ) {
        backRow.push({
          id: "aisle-back",
          type: "aisle",
          label: "",
          originalLabel: "",
        });
      }

      const originalLabel = `${String.fromCharCode(65 + i)}${layout.totalRows + 1}`;
      const customLabel = customLabels[originalLabel];

      backRow.push({
        id: `seat-back-${i}`,
        type: "available",
        label: customLabel || originalLabel,
        originalLabel,
      });
    }

    rows.push(backRow);
  }

  return rows;
}

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

function SeatLayoutPreview({
  layout,
  isEditing = false,
  onSeatLabelChange,
}: {
  layout: SeatLayout;
  isEditing?: boolean;
  onSeatLabelChange?: (originalLabel: string, newLabel: string) => void;
}) {
  const seats = generateSeats(layout);

  return (
    <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto">
      <div className="min-w-[300px] max-w-[500px] mx-auto">
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

        <div className="space-y-2">
          {seats.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-center gap-1">
              {row.map((seat, colIndex) => {
                if (seat.type === "aisle") {
                  return <div key={`${rowIndex}-${colIndex}`} className="w-8 h-10" />;
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
                if (isEditing && onSeatLabelChange) {
                  return (
                    <div key={seat.id} className="relative">
                      <input
                        type="text"
                        value={seat.label}
                        onChange={(e) =>
                          onSeatLabelChange(seat.originalLabel, e.target.value)
                        }
                        className="w-12 h-10 text-center text-xs font-medium rounded-lg border-2 transition-all bg-blue-500 text-white border-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                        placeholder={seat.originalLabel}
                        title={`ที่นั่ง ${seat.originalLabel}`}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={seat.id}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm transition-colors bg-blue-500 hover:bg-blue-600"
                    title={`ที่นั่ง ${seat.originalLabel}${layout.customSeatLabels?.[seat.originalLabel] ? ` (แสดงเป็น: ${seat.label})` : ""}`}>
                    {seat.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {layout.totalSeats}
            </p>
            <p className="text-sm text-gray-500">ที่นั่งทั้งหมด</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">
              {Object.keys(layout.customSeatLabels || {}).length}
            </p>
            <p className="text-sm text-gray-500">ป้ายชื่อกำหนดเอง</p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium text-blue-900 mb-1">วิธีใช้:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>คลิกที่ช่องที่นั่งแล้วพิมพ์ชื่อใหม่</li>
              <li>
                ปล่อยว่างเพื่อใช้ชื่อเริ่มต้น (
                {seats[1]?.find((s) => s.type === "available")?.originalLabel ||
                  "A1"}
                )
              </li>
              <li>ที่นั่งที่มีชื่อกำหนดเองจะแสดงค่าที่แก้ไว้</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BusesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BusData>>(createInitialFormData);

  const loadBuses = async () => {
    try {
      const data = await apiRequest<unknown[]>("/api/buses");
      setBuses(data.map((item) => mapBus(item)));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "โหลดข้อมูลรถบัสไม่สำเร็จ";
      alert(message);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await apiRequest<unknown[]>("/api/buses");
        if (cancelled) {
          return;
        }
        setBuses(data.map((item) => mapBus(item)));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "โหลดข้อมูลรถบัสไม่สำเร็จ";
        alert(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

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
    setFormData({
      ...bus,
      layout: {
        ...bus.layout,
        customSeatLabels: { ...(bus.layout.customSeatLabels || {}) },
      },
    });
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedBus(null);
    setFormData(createInitialFormData());
    setIsAddModalOpen(true);
  };

  const calculateTotalSeats = (layout: SeatLayout): number => {
    const regularSeats = layout.totalRows * Math.max(layout.seatsPerRow - 1, 1);
    const backSeats = layout.hasBackRow ? layout.backRowSeats : 0;
    return regularSeats + backSeats;
  };

  const updateLayoutField = (
    field: keyof SeatLayout,
    value: number | boolean,
  ) => {
    setFormData((prev) => {
      const currentLayout = prev.layout || createDefaultSeatLayout(prev.totalSeats || 40);
      const nextLayout = {
        ...currentLayout,
        [field]: value,
      } as SeatLayout;

      if (field !== "totalSeats") {
        nextLayout.totalSeats = calculateTotalSeats(nextLayout);
      }

      return {
        ...prev,
        totalSeats: nextLayout.totalSeats,
        layout: nextLayout,
      };
    });
  };

  const closeFormModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedBus(null);
    setFormData(createInitialFormData());
  };

  const handleSave = async () => {
    const layout = formData.layout || createDefaultSeatLayout(40);
    const busNumber = formData.busNumber?.trim();

    if (!busNumber) {
      alert("กรุณากรอกหมายเลขรถ");
      return;
    }

    try {
      const payload = {
        busNumber,
        type: formData.type || defaultBusType,
        status: formData.status || "active",
        totalSeats: layout.totalSeats,
        layout,
      };

      if (isAddModalOpen) {
        await apiRequest("/api/buses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (isEditModalOpen && selectedBus) {
        await apiRequest(`/api/buses/${selectedBus.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }

      closeFormModal();
      await loadBuses();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "บันทึกข้อมูลรถบัสไม่สำเร็จ";
      alert(message);
    }
  };

  const handleDelete = async (busId: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบรถคันนี้?")) {
      return;
    }

    try {
      await apiRequest(`/api/buses/${busId}`, {
        method: "DELETE",
      });
      await loadBuses();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ลบรถบัสไม่สำเร็จ";
      alert(message);
    }
  };

  const handleDuplicate = async (bus: BusData) => {
    const busNumber = window.prompt(
      "หมายเลขรถของสำเนา",
      `${bus.busNumber}-copy`,
    );

    if (!busNumber?.trim()) {
      return;
    }

    try {
      await apiRequest("/api/buses", {
        method: "POST",
        body: JSON.stringify({
          busNumber: busNumber.trim(),
          type: bus.type,
          status: bus.status,
          totalSeats: bus.totalSeats,
          layout: bus.layout,
        }),
      });
      await loadBuses();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "คัดลอกรถบัสไม่สำเร็จ";
      alert(message);
    }
  };

  const handleSeatLabelChange = (originalLabel: string, newLabel: string) => {
    setFormData((prev) => {
      const currentLayout = prev.layout || createDefaultSeatLayout(prev.totalSeats || 40);
      const currentLabels = currentLayout.customSeatLabels || {};
      const updatedLabels = { ...currentLabels };

      if (newLabel.trim() === "" || newLabel === originalLabel) {
        delete updatedLabels[originalLabel];
      } else {
        updatedLabels[originalLabel] = newLabel.trim();
      }

      return {
        ...prev,
        layout: {
          ...currentLayout,
          customSeatLabels: updatedLabels,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 transition-all duration-300">
        <Header title="จัดการรถบัส" breadcrumbs={["หน้าหลัก", "จัดการรถบัส"]} />
        <main className="p-4 sm:p-6">
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
                      onClick={() => void handleDuplicate(bus)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="คัดลอก">
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(bus)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไข">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => void handleDelete(bus.id)}
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

                <div className="mt-3 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {generateSeats(bus.layout)
                      .slice(0, 4)
                      .map((row, idx) => (
                        <div key={idx} className="flex gap-0.5">
                          {row
                            .filter((seat) => seat.type === "available")
                            .slice(0, 4)
                            .map((seat, seatIndex) => (
                              <div
                                key={seatIndex}
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

      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeFormModal}
        title={
          isAddModalOpen
            ? "เพิ่มรถบัสใหม่"
            : `แก้ไขรถบัส ${selectedBus?.busNumber}`
        }
        size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเลขรถ
              </label>
              <input
                type="text"
                value={formData.busNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, busNumber: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 815-1, VIP-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทรถ
              </label>
              <CustomSelect
                value={formData.type || defaultBusType}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value as string }))
                }
                options={[
                  { value: "มาตรฐาน", label: "มาตรฐาน" },
                  { value: "VIP", label: "VIP" },
                  { value: "มินิบัส", label: "มินิบัส" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <CustomSelect
                value={formData.status || "active"}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as "active" | "maintenance",
                  }))
                }
                options={[
                  { value: "active", label: "พร้อมใช้งาน" },
                  { value: "maintenance", label: "ซ่อมบำรุง" },
                ]}
              />
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
                  value={formData.layout?.totalRows ?? 10}
                  onChange={(e) =>
                    updateLayoutField(
                      "totalRows",
                      Number.parseInt(e.target.value, 10) || 1,
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
                  value={formData.layout?.seatsPerRow ?? 4}
                  onChange={(e) =>
                    updateLayoutField(
                      "seatsPerRow",
                      Number.parseInt(e.target.value, 10) || 2,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  มีแถวหลัง
                </label>
                <CustomSelect
                  value={formData.layout?.hasBackRow ? "yes" : "no"}
                  onChange={(value) =>
                    updateLayoutField("hasBackRow", value === "yes")
                  }
                  options={[
                    { value: "no", label: "ไม่มี" },
                    { value: "yes", label: "มี" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนที่นั่งแถวหลัง
                </label>
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={formData.layout?.backRowSeats ?? 0}
                  onChange={(e) =>
                    updateLayoutField(
                      "backRowSeats",
                      Number.parseInt(e.target.value, 10) || 0,
                    )
                  }
                  disabled={!formData.layout?.hasBackRow}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  ที่นั่งทั้งหมด
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.layout?.totalSeats ?? 40}
                </span>
              </div>
            </div>

            <button
              onClick={() => void handleSave()}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              <Save size={20} />
              <span>
                {isAddModalOpen ? "เพิ่มรถบัส" : "บันทึกการเปลี่ยนแปลง"}
              </span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ตัวอย่างผังที่นั่ง (คลิกที่ที่นั่งเพื่อแก้ไขชื่อ)
            </label>
            {formData.layout && (
              <SeatLayoutPreview
                layout={formData.layout}
                isEditing={true}
                onSeatLabelChange={handleSeatLabelChange}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
