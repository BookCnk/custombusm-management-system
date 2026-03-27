"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { month: "Feb", value1: 40, value2: 60 },
  { month: "Mar", value1: 75, value2: 90 },
  { month: "Apr", value1: 35, value2: 45 },
  { month: "May", value1: 60, value2: 75 },
  { month: "Jun", value1: 90, value2: 110 },
  { month: "Jul", value1: 45, value2: 70 },
  { month: "Aug", value1: 30, value2: 50 },
  { month: "Sep", value1: 85, value2: 100 },
  { month: "Oct", value1: 70, value2: 90 },
];

const pieData = [
  { name: "USA", value: 35, color: "#8b5cf6" },
  { name: "Germany", value: 25, color: "#c4b5fd" },
  { name: "UK", value: 20, color: "#ddd6fe" },
  { name: "France", value: 20, color: "#ede9fe" },
];

export function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Year Sales</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="value1" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="value2" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales By Countries</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
