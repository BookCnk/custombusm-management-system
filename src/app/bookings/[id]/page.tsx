import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  Clock,
  MapPinned,
  Ticket,
  Eye,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { normalizeSeatLayout } from "@/lib/bus-management";
import BookingClient from "./BookingClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getScheduleData(scheduleId: string) {
  const id = parseInt(scheduleId, 10);
  if (isNaN(id) || id <= 0) return null;

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      bus: true,
      route: {
        include: {
          stations: {
            where: { stopOrder: { gt: 0 } },
            orderBy: { stopOrder: "asc" },
          },
        },
      },
      bookings: {
        where: { status: "CONFIRMED" },
        select: { seatNumber: true },
      },
    },
  });

  if (!schedule) return null;

  return schedule;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const schedule = await getScheduleData(id);

  if (!schedule) {
    notFound();
  }

  const layout = normalizeSeatLayout(
    schedule.bus.layout,
    schedule.bus.totalSeats,
  );
  const bookedSeats = schedule.bookings.map((b) => b.seatNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/bookings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              <span>กลับ</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              จองตั๋วรถตู้
            </h1>
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-blue-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Bus size={20} />
              <span>รถหมายเลข {schedule.bus.busNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinned size={20} />
              <span>{schedule.route.routeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={20} />
              <span>
                {new Date(schedule.departureDate).toLocaleDateString("th-TH")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{schedule.departureTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-8">
            <div className="flex items-center gap-2 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
              <Ticket size={18} />
              จองที่นั่ง
            </div>
            <Link
              href={`/bookings/${id}/preview`}
              className="flex items-center gap-2 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              <Eye size={18} />
              ดูตั๋วที่จองแล้ว
            </Link>
          </div>
        </div>
      </div>

      {/* Client Component for interactivity */}
      <BookingClient
        scheduleId={id}
        layout={layout}
        stations={schedule.route.stations}
        bookedSeats={bookedSeats}
      />
    </div>
  );
}
