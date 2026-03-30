"use client";

import { Users, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

const stats = [
  {
    icon: <Users size={24} className="text-blue-500" />,
    label: "New Leads",
    value: "205",
    bgColor: "bg-blue-50",
  },
  {
    icon: <TrendingUp size={24} className="text-blue-500" />,
    label: "Sales",
    value: "205",
    bgColor: "bg-blue-50",
  },
  {
    icon: <ShoppingBag size={24} className="text-blue-500" />,
    label: "Orders",
    value: "205",
    bgColor: "bg-blue-50",
  },
  {
    icon: <DollarSign size={24} className="text-blue-500" />,
    label: "Expenses",
    value: "$1200",
    bgColor: "bg-blue-50",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`${stat.bgColor} p-3 rounded-lg`}>{stat.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
