"use client";

import {
  type ReactNode,
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  buildBookingSnapshot,
  type BookingSnapshotRecord,
} from "./booking-realtime-shared";

const BOOKING_SYNC_CHANNEL = "custombusm-bookings";
const BOOKING_POLL_INTERVAL_MS = 3000;

interface BookingRealtimeShellProps {
  children: ReactNode;
  scheduleId: number;
  initialSnapshot: string;
}

export function announceScheduleBookingChange(scheduleId: number) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(BOOKING_SYNC_CHANNEL);
  channel.postMessage({ scheduleId, timestamp: Date.now() });
  channel.close();
}

export default function BookingRealtimeShell({
  children,
  scheduleId,
  initialSnapshot,
}: BookingRealtimeShellProps) {
  const router = useRouter();
  const latestSnapshotRef = useRef(initialSnapshot);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestSnapshotRef.current = initialSnapshot;
  }, [initialSnapshot]);

  const queueRefresh = useEffectEvent(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 150);
  });

  const syncFromApi = useEffectEvent(async () => {
    try {
      const bookings = await apiRequest<BookingSnapshotRecord[]>(
        `/api/bookings?scheduleId=${scheduleId}&status=CONFIRMED`,
      );
      const nextSnapshot = buildBookingSnapshot(bookings);

      if (nextSnapshot !== latestSnapshotRef.current) {
        latestSnapshotRef.current = nextSnapshot;
        queueRefresh();
      }
    } catch {
      // Keep the current UI when background sync fails.
    }
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const pollInterval = setInterval(() => {
      void syncFromApi();
    }, BOOKING_POLL_INTERVAL_MS);

    const broadcastChannel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(BOOKING_SYNC_CHANNEL)
        : null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncFromApi();
      }
    };

    const handleWindowFocus = () => {
      void syncFromApi();
    };

    const handleBroadcast = (event: MessageEvent<{ scheduleId?: number }>) => {
      if (event.data?.scheduleId === scheduleId) {
        void syncFromApi();
      }
    };

    broadcastChannel?.addEventListener("message", handleBroadcast);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const realtimeChannel = supabase
      ?.channel(`booking-sync-${scheduleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Booking",
          filter: `scheduleId=eq.${scheduleId}`,
        },
        () => {
          void syncFromApi();
        },
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      broadcastChannel?.removeEventListener("message", handleBroadcast);
      broadcastChannel?.close();
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (supabase && realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
      }
    };
  }, [scheduleId, router]);

  return children;
}
