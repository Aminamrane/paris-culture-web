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

// Key Paris cultural agendas on OpenAgenda
// You can find more at: https://openagenda.com/search?search=paris+culture
const PARIS_AGENDAS = [
  "paris-musees",        // Paris Musées
  "paris-bibliotheques", // Bibliothèques de Paris
  "centrepompidou",      // Centre Pompidou
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

  // Fetch from all Paris agendas in parallel
  const results = await Promise.allSettled(
    PARIS_AGENDAS.map((slug) =>
      fetchAgendaEvents(slug, { limit: Math.ceil(limit / PARIS_AGENDAS.length), from: now })
    )
  );

  const all: OpenAgendaEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") all.push(...result.value);
  }

  // Sort by start date
  all.sort((a, b) => {
    const dateA = a.firstTiming?.begin || "";
    const dateB = b.firstTiming?.begin || "";
    return dateA.localeCompare(dateB);
  });

  return all.slice(0, limit);
}

export function openAgendaEventToParisEvent(e: OpenAgendaEvent) {
  const coverUrl = e.image?.base && e.image?.filename
    ? `${e.image.base}${e.image.filename}`
    : null;

  return {
    id: `oa-${e.uid}`,
    title: e.title?.fr || e.title?.en || "Sans titre",
    lead_text: e.description?.fr?.slice(0, 200) || null,
    description: e.description?.fr || null,
    cover_url: coverUrl,
    image_couverture: null,
    date_start: e.firstTiming?.begin || null,
    date_end: e.lastTiming?.end || null,
    address_name: e.location?.name || null,
    address_street: e.location?.address || null,
    address_zipcode: e.location?.postalCode || null,
    address_city: e.location?.city || "Paris",
    lat_lon: e.location?.latitude && e.location?.longitude
      ? { lat: e.location.latitude, lon: e.location.longitude }
      : null,
    price_type: e.conditions?.fr ? "payant" : "gratuit",
    price_detail: e.conditions?.fr || null,
    access_link: e.registration?.[0]?.value || null,
    contact_url: null,
    contact_phone: null,
    contact_mail: null,
    contact_facebook: null,
    contact_instagram: null,
    tags: e.keywords?.fr?.join(",") || null,
    qfap_tags: null,
    universe_tags: null,
    group: null,
    audience: null,
    url: `https://openagenda.com/agendas/${e.agendaSlug}/events/${e.slug}`,
    programs: null,
    transport: null,
    pmr: null,
    blind: null,
    deaf: null,
  };
}
