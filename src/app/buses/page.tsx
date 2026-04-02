import BusesPageClient from "./BusesPageClient";

import { getInitialBuses } from "@/lib/server-page-data";

export const dynamic = "force-dynamic";

export default async function BusesPage() {
  const initialBuses = await getInitialBuses();

  return <BusesPageClient initialBuses={initialBuses} />;
}
