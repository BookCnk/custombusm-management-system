"use client";

import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { StatCards } from "../components/StatCards";
import { Charts } from "../components/Charts";
import { SalesCards } from "../components/SalesCards";
import { TopSellingProducts } from "../components/TopSellingProducts";
import { TeamCards } from "../components/TeamCards";
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
          title="Dashboard V1"
          breadcrumbs={["Dashboard", "Dashboard V1"]}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6">
          <div className="space-y-6">
            <StatCards />
            <Charts />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <SalesCards />
              </div>
              <div className="lg:col-span-1">
                <TopSellingProducts />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <TeamCards />
                <DataTable />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
