import RoutesPageClient from "./RoutesPageClient";

import { getInitialRoutes } from "@/lib/server-page-data";

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const initialRoutes = await getInitialRoutes();

  return <RoutesPageClient initialRoutes={initialRoutes} />;
}
