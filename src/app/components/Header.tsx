"use client";

import { Bell, Settings, Search, Menu } from "lucide-react";
import Image from "next/image";

export function Header({
  title = "Dashboard",
  breadcrumbs = ["Dashboard"],
  onMenuToggle,
}: {
  title?: string;
  breadcrumbs?: string[];
  onMenuToggle?: () => void;
}) {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 sm:items-center">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <div className="mb-1 hidden flex-wrap items-center gap-2 text-xs text-gray-500 sm:flex sm:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="min-w-0 truncate">
                  {index > 0 && <span className="mx-2">ยป</span>}
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
          <button className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:inline-flex">
            <Search size={20} />
          </button>
          <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <Settings size={20} />
          </button>
          <div className="ml-2 flex items-center gap-3 sm:ml-4">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-500">
              <Image
                src="https://i.pravatar.cc/150?img=12"
                alt="User"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
