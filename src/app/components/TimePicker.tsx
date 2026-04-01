"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, setHours] = useState(() => {
    if (value) {
      const [h] = value.split(":").map(Number);
      return h || 0;
    }
    return 0;
  });
  const [minutes, setMinutes] = useState(() => {
    if (value) {
      const [, m] = value.split(":").map(Number);
      return m || 0;
    }
    return 0;
  });
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const updateTime = (h: number, m: number) => {
    const formatted = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    onChange(formatted);
  };

  const handleHourChange = (newHour: number) => {
    const clamped = Math.max(0, Math.min(23, newHour));
    setHours(clamped);
    updateTime(clamped, minutes);
  };

  const handleMinuteChange = (newMinute: number) => {
    const clamped = Math.max(0, Math.min(59, newMinute));
    setMinutes(clamped);
    updateTime(hours, clamped);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const scrollToCenter = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
  ) => {
    if (ref.current) {
      const itemHeight = 40;
      ref.current.scrollTop = index * itemHeight - itemHeight;
    }
  };

  useEffect(() => {
    if (!isInitialized.current) {
      scrollToCenter(hoursRef, hours);
      scrollToCenter(minutesRef, minutes);
      isInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-3 shadow-sm">
      {/* Hours Column */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => handleHourChange(hours + 1)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95">
          <ChevronUp size={18} />
        </button>
        <div
          ref={hoursRef}
          className="h-44 w-14 overflow-y-scroll scrollbar-hide relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="py-[88px]">
            {hoursList.map((h) => (
              <div
                key={h}
                onClick={() => handleHourChange(h)}
                className={`h-11 w-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 rounded-lg ${
                  h === hours
                    ? "text-white bg-blue-600 shadow-md shadow-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}>
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleHourChange(hours - 1)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95">
          <ChevronDown size={18} />
        </button>
        <span className="text-xs text-gray-400 font-medium mt-1">ชั่วโมง</span>
      </div>

      {/* Separator */}
      <div className="flex flex-col items-center justify-center pb-6">
        <span className="text-2xl font-bold text-gray-300">:</span>
      </div>

      {/* Minutes Column */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => handleMinuteChange(minutes + 1)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95">
          <ChevronUp size={18} />
        </button>
        <div
          ref={minutesRef}
          className="h-44 w-14 overflow-y-scroll scrollbar-hide relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="py-[88px]">
            {minutesList.map((m) => (
              <div
                key={m}
                onClick={() => handleMinuteChange(m)}
                className={`h-11 w-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 rounded-lg ${
                  m === minutes
                    ? "text-white bg-blue-600 shadow-md shadow-blue-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}>
                {m.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleMinuteChange(minutes - 1)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-95">
          <ChevronDown size={18} />
        </button>
        <span className="text-xs text-gray-400 font-medium mt-1">นาที</span>
      </div>

      {/* Selected Time Preview */}
      <div className="ml-2 pl-3 border-l border-gray-200">
        <div className="text-xs text-gray-400 font-medium mb-1">
          เวลาที่เลือก
        </div>
        <div className="text-lg font-bold text-blue-600">
          {hours.toString().padStart(2, "0")}:
          {minutes.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="departureTime"
        value={`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`}
      />
    </div>
  );
}
