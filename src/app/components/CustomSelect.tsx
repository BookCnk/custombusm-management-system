"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  className = "",
  disabled = false,
  label,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation when dropdown opens
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      const index = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`
          custom-select-trigger
          ${disabled ? "custom-select-disabled" : ""}
          ${isOpen ? "custom-select-open" : ""}
        `}
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-controls={isOpen ? "select-dropdown" : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `option-${highlightedIndex}`
            : undefined
        }>
        <span className={selectedOption ? "text-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          id="select-dropdown"
          className="custom-select-dropdown"
          role="listbox">
          {options.length === 0 ? (
            <div className="custom-select-option custom-select-no-results">
              ไม่มีตัวเลือก
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                id={`option-${index}`}
                className={`
                  custom-select-option
                  ${option.value === value ? "custom-select-selected" : ""}
                  ${index === highlightedIndex ? "custom-select-highlighted" : ""}
                `}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={option.value === value}>
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
