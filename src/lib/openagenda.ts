/**
 * OpenAgenda API client
 *
 * To use:
 * 1. Create an account at https://openagenda.com
 * 2. Go to your account settings → API keys
 * 3. Add OPENAGENDA_API_KEY to your .env file
 *
 * Docs: https://developers.openagenda.com/
 */

const BASE_URL = "https://api.openagenda.com/v2";
const API_KEY = process.env.OPENAGENDA_API_KEY;

// Active OpenAgenda agendas containing Paris events — filtered by city
// Free-tier API doesn't allow cross-agenda search, so we aggregate known active ones
const PARIS_AGENDAS = [
  "lclo-2026",                    // La Classe L'Œuvre 2026 (Nuit des Musées)
  "jep-2025-ile-de-france",       // Journées européennes du patrimoine
  "nuit-europeenne-des-musees-2025",
  "nuit-blanche",
  "printemps-des-poetes-2026",
];

export interface OpenAgendaEvent {
  uid: number;
  slug: string;
  title: { fr?: string; en?: string };
  description: { fr?: string; en?: string } | null;
  image: { base?: string; filename?: string } | null;
  dateRange: string | null;
  firstTiming: { begin: string; end: string } | null;
  lastTiming: { begin: string; end: string } | null;
  location: {
    name: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  keywords: { fr?: string[] } | null;
  registration: { type: string; value: string }[] | null;
  conditions: { fr?: string } | null;
  agendaUid: number;
  agendaSlug: string;
}

interface OpenAgendaResponse {
  total: number;
  events: OpenAgendaEvent[];
}

async function fetchAgendaEvents(
  agendaSlug: string,
  options: { limit?: number; from?: string; to?: string; keywords?: string } = {}
): Promise<OpenAgendaEvent[]> {
  if (!API_KEY) return [];

  const params = new URLSearchParams({
    key: API_KEY,
    size: String(options.limit || 50),
    ...(options.from && { "timings[gte]": options.from }),
    ...(options.to && { "timings[lte]": options.to }),
    ...(options.keywords && { keyword: options.keywords }),
    includeLabels: "1",
  });

  const url = `${BASE_URL}/agendas/${agendaSlug}/events?${params}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) return [];
    const data: OpenAgendaResponse = await res.json();
    return (data.events || []).map((e) => ({ ...e, agendaSlug }));
  } catch {
    return [];
  }
}

export async function fetchParisOpenAgendaEvents(limit = 50): Promise<OpenAgendaEvent[]> {
  if (!API_KEY) {
    console.warn("OPENAGENDA_API_KEY not set — skipping OpenAgenda fetch");
    return [];
  }

  const now = new Date().toISOString();

  // Fetch from all agendas in parallel — fetch more than needed, filter by city after
  const results = await Promise.allSettled(
    PARIS_AGENDAS.map((slug) =>
      fetchAgendaEvents(slug, { limit: 100, from: now })
    )
  );

  const all: OpenAgendaEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") all.push(...result.value);
  }

  // Filter to Paris-only events (these agendas span all of France)
  const parisOnly = all.filter((e) => {
    const city = (e.location?.city || "").toLowerCase();
    if (!city) return false;
    return city === "paris" || city.startsWith("paris ") || /^paris\s*\d/.test(city);
  });

  // Sort by start date
  parisOnly.sort((a, b) => {
    const dateA = a.firstTiming?.begin || "";
    const dateB = b.firstTiming?.begin || "";
    return dateA.localeCompare(dateB);
  });

  return parisOnly.slice(0, limit);
}

import type { ParisEvent } from "./paris-opendata";

export function openAgendaEventToParisEvent(e: OpenAgendaEvent): ParisEvent {
  const coverUrl = e.image?.base && e.image?.filename
    ? `${e.image.base}${e.image.filename}`
    : null;

  return {
    id: `oa-${e.uid}`,
    title: e.title?.fr || e.title?.en || "Sans titre",
    lead_text: e.description?.fr?.slice(0, 200) || null,
    description: e.description?.fr || null,
    date_start: e.firstTiming?.begin || null,
    date_end: e.lastTiming?.end || null,
    date_description: e.dateRange || null,
    cover_url: coverUrl,
    cover_alt: null,
    address_name: e.location?.name || null,
    address_street: e.location?.address || null,
    address_zipcode: e.location?.postalCode || null,
    address_city: e.location?.city || "Paris",
    lat_lon: e.location?.latitude && e.location?.longitude
      ? { lat: e.location.latitude, lon: e.location.longitude }
      : null,
    price_type: e.conditions?.fr ? "payant" : "gratuit",
    price_detail: e.conditions?.fr || null,
    access_type: null,
    access_link: e.registration?.[0]?.value || null,
    transport: null,
    pmr: null,
    blind: null,
    deaf: null,
    contact_url: null,
    contact_phone: null,
    contact_mail: null,
    contact_facebook: null,
    contact_instagram: null,
    tags: e.keywords?.fr?.join(",") || null,
    qfap_tags: e.keywords?.fr?.join(",") || null,
    url: `https://openagenda.com/agendas/${e.agendaSlug}/events/${e.slug}`,
    image_couverture: null,
    programs: null,
  };
}

// Normalize title for deduplication (lowercase, no accents, no punctuation)
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupKey(event: ParisEvent): string {
  const title = normalizeTitle(event.title);
  const day = event.date_start ? event.date_start.slice(0, 10) : "";
  return `${title}||${day}`;
}

// Merge lists keeping primary's entries on conflict
export function mergeDedupEvents(primary: ParisEvent[], secondary: ParisEvent[]): ParisEvent[] {
  const seen = new Set(primary.map(dedupKey));
  const extras = secondary.filter((e) => {
    const key = dedupKey(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...primary, ...extras];
}
