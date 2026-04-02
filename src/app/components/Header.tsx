"use client";

import { Search, Menu, LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";
export function Header({
  title = "Dashboard",
  breadcrumbs = ["Dashboard"],
}: {
  title?: string;
  breadcrumbs?: string[];
}) {
  const { toggle } = useSidebar();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 sm:items-center">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <div className="mb-1 hidden flex-wrap items-center gap-2 text-xs text-gray-500 sm:flex sm:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="min-w-0 truncate">
                  {index > 0 && <span className="mx-2">›</span>}
                  <span
                    className={
                      index === breadcrumbs.length - 1 ? "text-gray-900" : ""
                    }>
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
            <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100">
            <LogOut size={18} />
            <span className="hidden text-sm font-medium sm:inline">
              ออกจากระบบ
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
