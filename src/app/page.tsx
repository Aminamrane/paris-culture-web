import MapView from "@/components/map/MapView";
import { type ParisEvent } from "@/lib/paris-opendata";

export const dynamic = "force-dynamic";

async function getEvents(): Promise<ParisEvent[]> {
  const now = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({
    limit: "100",
    where: `date_end>="${now}" AND lat_lon IS NOT NULL`,
    order_by: "date_start ASC",
    timezone: "Europe/Paris",
  });

  const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?${params}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    // Server fetch failed (e.g. NordVPN DNS issue locally)
    // Return empty — client will retry
    return [];
  }
}

export default async function MapPage() {
  const events = await getEvents();
  return <MapView initialEvents={events} />;
}
