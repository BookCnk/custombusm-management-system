"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [hours, minutes] = value.split(":").map((v) => parseInt(v, 10));
  const displayHours = isNaN(hours) ? 0 : hours;
  const displayMinutes = isNaN(minutes) ? 0 : minutes;

  const handleHoursChange = (delta: number) => {
    const newHours = (displayHours + delta + 24) % 24;
    onChange(
      `${String(newHours).padStart(2, "0")}:${String(displayMinutes).padStart(
        2,
        "0",
      )}`,
    );
  };

  const handleMinutesChange = (delta: number) => {
    const newMinutes = (displayMinutes + delta + 60) % 60;
    onChange(
      `${String(displayHours).padStart(2, "0")}:${String(newMinutes).padStart(
        2,
        "0",
      )}`,
    );
  };

  const handleDirectHoursInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 23) {
      onChange(
        `${String(val).padStart(2, "0")}:${String(displayMinutes).padStart(
          2,
          "0",
        )}`,
      );
    }
  };

  const handleDirectMinutesInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      onChange(
        `${String(displayHours).padStart(2, "0")}:${String(val).padStart(
          2,
          "0",
        )}`,
      );
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          <span className="font-medium text-gray-900">
            {String(displayHours).padStart(2, "0")}:
            {String(displayMinutes).padStart(2, "0")}
          </span>
          <span className="text-sm text-gray-500"> .</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-200 w-full">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-2 text-center">
                  0-23
                </label>
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleHoursChange(1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronUp size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={displayHours}
                    onChange={handleDirectHoursInput}
                    className="w-16 px-2 py-2 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleHoursChange(-1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-8">
                <span className="text-2xl font-bold text-gray-400">:</span>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-2 text-center">
                  0-59
                </label>
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronUp size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={displayMinutes}
                    onChange={handleDirectMinutesInput}
                    className="w-16 px-2 py-2 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleMinutesChange(-1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange("00:00");
                  setIsOpen(false);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                00:00
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("12:00");
                  setIsOpen(false);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                12:00
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                0
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
