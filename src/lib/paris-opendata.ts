// Paris Open Data — "Que Faire à Paris"
// API: https://opendata.paris.fr/api/v2/catalog/datasets/que-faire-a-paris-/records
// License: ODbL — No API key required

const BASE_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records";

export interface ParisEvent {
  id: string;
  title: string;
  lead_text: string | null;
  description: string | null;
  date_start: string | null;
  date_end: string | null;
  date_description: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  address_name: string | null;
  address_street: string | null;
  address_zipcode: string | null;
  address_city: string | null;
  lat_lon: { lat: number; lon: number } | null;
  price_type: string | null;
  price_detail: string | null;
  access_type: string | null;
  access_link: string | null;
  transport: string | null;
  pmr: number | null;
  blind: number | null;
  deaf: number | null;
  contact_url: string | null;
  contact_phone: string | null;
  contact_mail: string | null;
  contact_facebook: string | null;
  contact_instagram: string | null;
  tags: string | null;        // kept for compatibility
  qfap_tags: string | null;   // actual field from API
  url: string | null;
  image_couverture: string | null;
  programs: string | null;
}

export interface OpenDataResponse {
  total_count: number;
  results: ParisEvent[];
}

interface FetchOptions {
  limit?: number;
  offset?: number;
  where?: string;
  orderBy?: string;
  select?: string;
}

export async function fetchParisOpenData(
  options: FetchOptions = {}
): Promise<OpenDataResponse> {
  const { limit = 100, offset = 0, where, orderBy, select } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    timezone: "Europe/Paris",
  });

  if (where) params.set("where", where);
  if (orderBy) params.set("order_by", orderBy);
  if (select) params.set("select", select);

  const url = `${BASE_URL}?${params}`;
  const res = await fetch(url, { next: { revalidate: 1800 } }); // Cache 30min

  if (!res.ok) {
    throw new Error(`Paris Open Data API error: ${res.status}`);
  }

  return res.json();
}

// Only show events that haven't ended yet:
// - If date_end exists → use date_end >= today
// - If only date_start → use date_start >= today
function upcomingFilter(): string {
  const now = new Date().toISOString().split("T")[0];
  return `(date_end >= "${now}" OR (date_end IS NULL AND date_start >= "${now}"))`;
}

// Fetch upcoming events with geo coordinates
export async function fetchUpcomingEventsWithGeo(
  limit = 100
): Promise<ParisEvent[]> {
  const { results } = await fetchParisOpenData({
    limit,
    where: `${upcomingFilter()} AND lat_lon IS NOT NULL`,
    orderBy: "date_start ASC",
  });
  return results;
}

// Fetch events by category/tags
export async function fetchEventsByTag(
  tag: string,
  limit = 50
): Promise<ParisEvent[]> {
  const { results } = await fetchParisOpenData({
    limit,
    where: `${upcomingFilter()} AND qfap_tags LIKE "%${tag}%" AND lat_lon IS NOT NULL`,
    orderBy: "date_start ASC",
  });
  return results;
}

// Search events (only upcoming)
export async function searchEvents(
  query: string,
  limit = 50
): Promise<ParisEvent[]> {
  const { results } = await fetchParisOpenData({
    limit,
    where: `${upcomingFilter()} AND (search(title, "${query}") OR search(lead_text, "${query}"))`,
    orderBy: "date_start ASC",
  });
  return results;
}

// Fetch a single event by ID
export async function fetchEventById(
  id: string
): Promise<ParisEvent | null> {
  const { results } = await fetchParisOpenData({
    limit: 1,
    where: `id = "${id}"`,
  });
  return results[0] || null;
}

// Get cover image URL (handle different field names)
export function getEventCover(event: ParisEvent): string | null {
  if (event.cover_url) return event.cover_url;
  if (event.image_couverture) {
    try {
      const parsed = JSON.parse(event.image_couverture);
      return parsed?.url || null;
    } catch {
      return event.image_couverture;
    }
  }
  return null;
}

// Map price type to French label
export function getPriceLabel(priceType: string | null): string {
  switch (priceType) {
    case "gratuit":
      return "Gratuit";
    case "payant":
      return "Payant";
    case "conso":
      return "Consommation";
    default:
      return "";
  }
}

// Categorize event from tags
export function categorizeEvent(tags: string | null, qfapTags?: string | null): string {
  const raw = qfapTags || tags;
  if (!raw) return "autre";
  const t = raw.toLowerCase();
  if (t.includes("exposition") || t.includes("expo")) return "expo";
  if (t.includes("théâtre") || t.includes("theatre") || t.includes("spectacle")) return "theatre";
  if (t.includes("musique") || t.includes("concert")) return "musique";
  if (t.includes("conférence") || t.includes("conference") || t.includes("débat") || t.includes("debat")) return "debats";
  if (t.includes("street") || t.includes("urbain")) return "street";
  if (t.includes("littér") || t.includes("litter") || t.includes("livre") || t.includes("lecture")) return "litterature";
  if (t.includes("immersif") || t.includes("numérique") || t.includes("numerique")) return "immersif";
  if (t.includes("enfant") || t.includes("famille")) return "famille";
  if (t.includes("cinéma") || t.includes("cinema") || t.includes("film")) return "cinema";
  return "autre";
}

// Fixed venue keywords — permanent cultural locations
const FIXED_VENUE_KEYWORDS = [
  "théâtre", "theatre", "musée", "museum", "galerie", "gallery",
  "opéra", "opera", "palais", "philharmonie", "bibliothèque",
  "médiathèque", "conservatoire", "auditorium", "cinéma", "cinema",
  "centre culturel", "maison de la culture", "fondation",
  "institut", "académie", "comédie", "comedie", "odéon", "odeon",
  "châtelet", "chatelet", "bouffes", "athénée", "athenee",
];

// Detect if an event is at a fixed/permanent venue vs ephemeral location
export function isFixedVenue(event: ParisEvent): boolean {
  const name = (event.address_name || "").toLowerCase();

  // Check venue name against keywords
  if (FIXED_VENUE_KEYWORDS.some((kw) => name.includes(kw))) return true;

  // Long-running events (>6 months) are typically at fixed venues
  if (event.date_start && event.date_end) {
    const start = new Date(event.date_start).getTime();
    const end = new Date(event.date_end).getTime();
    const sixMonths = 180 * 24 * 60 * 60 * 1000;
    if (end - start > sixMonths) return true;
  }

  return false;
}
