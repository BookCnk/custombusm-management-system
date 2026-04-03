"use client";

import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Bus,
  MapPin,
  MapPinned,
  CalendarDays,
  Ticket,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useSidebar } from "./SidebarContext";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { href: "/buses", icon: Bus, label: "จัดการรถบัส" },
  { href: "/routes", icon: MapPinned, label: "จัดการเส้นทาง" },
  { href: "/stations", icon: MapPin, label: "จัดการจุดจอด" },
  { href: "/schedules", icon: CalendarDays, label: "ตารางเดินรถ" },
  { href: "/bookings", icon: Ticket, label: "การจองที่นั่ง" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col overflow-y-auto bg-slate-900 text-white transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-72 max-w-[85vw] translate-x-0"
            : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
        }`}>
        <div className="flex h-16 shrink-0 items-center justify-between p-4">
          {isOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-center text-xl font-bold text-white">
                ราชสีมาบ่อวินระยอง
              </h1>
            </div>
          )}
          <button
            onClick={toggle}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            title={isOpen ? "ยุบเมนู" : "ขยายเมนู"}>
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {isOpen && (
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-lg px-4 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-blue-500/20 text-blue-300"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                  )}>
                  <Icon size={18} className="mr-3 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {isOpen && (
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => void handleLogout()}
              className="flex w-full items-center rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <LogOut size={18} className="mr-3 shrink-0" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </aside>

      <div
        className={`hidden transition-all duration-300 lg:block ${isOpen ? "w-72" : "w-16"}`}
      />
    </>
  );
}
