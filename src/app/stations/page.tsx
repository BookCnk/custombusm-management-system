import StationsPageClient from "./StationsPageClient";

import { getInitialStations } from "@/lib/server-page-data";

export const dynamic = "force-dynamic";

export default async function StationsPage() {
  const { routes, stations } = await getInitialStations();

  return (
    <StationsPageClient
      initialRoutes={routes}
      initialStations={stations}
    />
  );
}
