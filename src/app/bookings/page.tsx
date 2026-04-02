import BookingsPageClient from "./BookingsPageClient";

import {
  getCurrentDateInputValue,
  getInitialSchedules,
} from "@/lib/server-page-data";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const initialSelectedDate = getCurrentDateInputValue();
  const initialSchedules = await getInitialSchedules(initialSelectedDate);

  return (
    <BookingsPageClient
      initialSelectedDate={initialSelectedDate}
      initialSchedules={initialSchedules}
    />
  );
}
