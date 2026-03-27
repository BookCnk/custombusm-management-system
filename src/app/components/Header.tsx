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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index}>
                  {index > 0 && <span className="mx-2">»</span>}
                  <span
                    className={
                      index === breadcrumbs.length - 1 ? "text-gray-900" : ""
                    }>
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-3 ml-4">
            <div className="w-9 h-9 rounded-full bg-purple-500 overflow-hidden">
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
