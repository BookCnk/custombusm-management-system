"use client";

import Image from "next/image";

const products = [
  {
    name: "Nike Air Jordan",
    description: "Comfy to wear everywhere",
    price: "$85",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
  },
  {
    name: "Rayban Sunglass",
    description: "Comfy to wear everywhere",
    price: "$85",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop",
  },
  {
    name: "Calvin Klein Perfume",
    description: "Comfy to wear everywhere",
    price: "$85",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop",
  },
];

export function TopSellingProducts() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Selling Products
      </h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {product.description}
              </p>
              <p className="text-xs font-semibold text-gray-900">
                {product.price}
              </p>
            </div>
            <button className="px-4 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
