"use client";

const tableData = [
  { page: "2065", newUser: "465", lastWeek: "23456" },
  { page: "1829", newUser: "735", lastWeek: "92565" },
  { page: "3165", newUser: "165", lastWeek: "32654" },
];

export function DataTable() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pages / Visit
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                New / User
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Last week
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="py-3 text-sm text-gray-900">{row.page}</td>
                <td className="py-3 text-sm text-gray-900">{row.newUser}</td>
                <td className="py-3 text-sm text-gray-900 text-right">{row.lastWeek}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
