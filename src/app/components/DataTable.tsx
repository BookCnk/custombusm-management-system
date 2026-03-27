"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "low" | "out";
  sales: number;
}

const products: Product[] = [
  {
    id: "1",
    name: "Nike Air Jordan",
    category: "Shoes",
    price: 85,
    stock: 120,
    status: "active",
    sales: 2065,
  },
  {
    id: "2",
    name: "Rayban Sunglass",
    category: "Accessories",
    price: 85,
    stock: 45,
    status: "low",
    sales: 1829,
  },
  {
    id: "3",
    name: "Calvin Klein Perfume",
    category: "Beauty",
    price: 85,
    stock: 0,
    status: "out",
    sales: 3165,
  },
  {
    id: "4",
    name: "Apple Watch Series 9",
    category: "Electronics",
    price: 399,
    stock: 23,
    status: "low",
    sales: 1567,
  },
  {
    id: "5",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    price: 348,
    stock: 89,
    status: "active",
    sales: 2434,
  },
  {
    id: "6",
    name: "Adidas Ultraboost",
    category: "Shoes",
    price: 180,
    stock: 156,
    status: "active",
    sales: 1890,
  },
];

const statusStyles = {
  active: "bg-green-100 text-green-700",
  low: "bg-yellow-100 text-yellow-700",
  out: "bg-red-100 text-red-700",
};

const statusLabels = {
  active: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
};

export function DataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage your products and view their sales performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Product
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Price
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors ml-auto">
                  Sales
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(product.id)}
                    onChange={() => toggleSelectRow(product.id)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    ${product.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      statusStyles[product.status]
                    }`}>
                    {statusLabels[product.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {product.sales.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">1</span> to{" "}
          <span className="font-medium text-gray-900">
            {filteredProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{products.length}</span>{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={18} />
          </button>
          <button className="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-lg">
            1
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            2
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            3
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
