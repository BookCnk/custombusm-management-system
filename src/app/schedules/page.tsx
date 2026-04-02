import SchedulesPageClient from "./SchedulesPageClient";

import {
  getCurrentDateInputValue,
  getInitialSchedulesPageData,
} from "@/lib/server-page-data";

export const dynamic = "force-dynamic";

export default async function SchedulesPage() {
  const initialSelectedDate = getCurrentDateInputValue();
  const { buses, routes, schedules } =
    await getInitialSchedulesPageData(initialSelectedDate);

  return (
    <SchedulesPageClient
      initialSelectedDate={initialSelectedDate}
      initialBuses={buses}
      initialRoutes={routes}
      initialSchedules={schedules}
    />
  );
}
