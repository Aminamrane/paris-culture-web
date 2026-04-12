import type { ParisOpenDataRecord, ParisOpenDataResponse } from "@/types";

const BASE_URL =
  process.env.OPENDATA_PARIS_BASE_URL ||
  "https://opendata.paris.fr/api/v2/catalog/datasets/que-faire-a-paris-";

interface FetchEventsOptions {
  rows?: number;
  offset?: number;
  where?: string;
  sort?: string;
}

export async function fetchParisEvents(
  options: FetchEventsOptions = {}
): Promise<ParisOpenDataResponse> {
  const { rows = 100, offset = 0, where, sort } = options;

  const params = new URLSearchParams({
    rows: String(rows),
    offset: String(offset),
  });

  if (where) params.set("where", where);
  if (sort) params.set("sort", sort);

  const response = await fetch(`${BASE_URL}/records?${params}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Paris Open Data API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchUpcomingEvents(
  limit = 50
): Promise<ParisOpenDataRecord[]> {
  const now = new Date().toISOString();
  const { results } = await fetchParisEvents({
    rows: limit,
    where: `date_start>='${now}'`,
    sort: "date_start",
  });
  return results;
}

export async function fetchEventsByCategory(
  category: string,
  limit = 50
): Promise<ParisOpenDataRecord[]> {
  const now = new Date().toISOString();
  const { results } = await fetchParisEvents({
    rows: limit,
    where: `date_start>='${now}' AND tags LIKE '%${category}%'`,
    sort: "date_start",
  });
  return results;
}

export function mapPriceType(
  priceType: string | null
): "FREE" | "PAID" | "CONSUMPTION" | null {
  switch (priceType) {
    case "gratuit":
      return "FREE";
    case "payant":
      return "PAID";
    case "conso":
      return "CONSUMPTION";
    default:
      return null;
  }
}
