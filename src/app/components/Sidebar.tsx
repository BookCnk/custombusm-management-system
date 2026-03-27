"use client";

import { LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function Sidebar({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col overflow-y-auto z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
        }`}>
        {/* Logo & Toggle button */}
        <div className="p-4 flex items-center justify-between h-16 shrink-0">
          {isOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="font-bold text-white">A</span>
              </div>
              <span className="font-semibold text-lg whitespace-nowrap">
                AatroX
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
            title={isOpen ? "ยุบเมนู" : "ขยายเมนู"}>
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Nav - only show when open */}
        {isOpen && (
          <nav className="flex-1 px-3 py-4">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-lg">
              <LayoutDashboard size={18} className="mr-3" />
              <span>แดชบอร์ด</span>
            </Link>
          </nav>
        )}
      </aside>

      {/* Spacer for fixed sidebar - adjusts with sidebar width */}
      <div
        className={`hidden lg:block transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}
      />
    </>
  );
}
