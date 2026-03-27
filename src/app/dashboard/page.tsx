"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { DataTable } from "../components/DataTable";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 transition-all duration-300">
        <Header
          title="แดชบอร์ด V1"
          breadcrumbs={["แดชบอร์ด", "แดชบอร์ด V1"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6">
          <DataTable />
        </main>
      </div>
    </div>
  );
}
