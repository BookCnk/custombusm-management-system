"use client";

import Image from "next/image";
import { Globe, MessageCircle, Share2 } from "lucide-react";

const team = [
  {
    name: "Martha Hunt",
    role: "UI/UX Designer",
    description: "Create Usable interface and designs @uilib.com",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "James Anderson",
    role: "UI/UX Designer",
    description: "Create Usable interface and designs @uilib.com",
    image: "https://i.pravatar.cc/150?img=11",
  },
];

export function TeamCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {team.map((member) => (
        <div
          key={member.name}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 overflow-hidden">
            <Image
              src={member.image}
              alt={member.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <h4 className="font-semibold text-gray-900">{member.name}</h4>
          <p className="text-sm text-gray-500 mb-1">{member.role}</p>
          <p className="text-xs text-gray-400 mb-4">{member.description}</p>
          <button className="px-4 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors mb-4">
            Hire Me
          </button>
          <div className="flex items-center justify-center gap-3">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <Globe size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <MessageCircle size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
