"use client";

import { LayoutDashboard, Menu, X } from "lucide-react";
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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
        {/* Logo & Close button */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="font-semibold text-lg">AatroX</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-lg">
            <LayoutDashboard size={18} className="mr-3" />
            <span>Dashboard</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile toggle button (floating) */}
      <button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 bg-slate-900 text-white rounded-lg shadow-lg transition-opacity ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}>
        <Menu size={20} />
      </button>
    </>
  );
}
