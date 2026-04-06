"use client";

import dynamic from "next/dynamic";

import { type SeatLayout } from "@/lib/bus-management";

interface RouteStation {
  id: number;
  stationName: string;
  stopOrder: number;
}

interface BookingItem {
  id: number;
  seatNumber: string;
  price: number;
  pickupStation: {
    stationName: string;
  } | null;
  dropoffStation: {
    stationName: string;
  } | null;
}

const BookingClient = dynamic(() => import("./BookingClient"), {
  ssr: false,
});

interface BookingClientShellProps {
  scheduleId: string;
  layout: SeatLayout;
  stations?: RouteStation[];
  bookings?: BookingItem[];
}

export default function BookingClientShell(props: BookingClientShellProps) {
  return <BookingClient {...props} />;
}
