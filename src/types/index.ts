// Paris Open Data API response types

export interface ParisOpenDataRecord {
  id: string;
  title: string;
  lead_text: string | null;
  description: string | null;
  date_start: string | null;
  date_end: string | null;
  date_description: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  cover_credit: string | null;
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
  tags: string | null;
  universe_tags: string | null;
  group: string | null;
  audience: string | null;
  url: string | null;
  programs: string | null;
}

export interface ParisOpenDataResponse {
  total_count: number;
  results: ParisOpenDataRecord[];
}

// App types

export interface EventFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  priceType?: "FREE" | "PAID" | "CONSUMPTION";
  accessibility?: ("pmr" | "blind" | "deaf")[];
  search?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export const PARIS_CENTER: MapViewState = {
  longitude: 2.3522,
  latitude: 48.8566,
  zoom: 12,
};

export const CATEGORIES = {
  expo: { label: "Expositions", color: "#E85D3A", icon: "🎨" },
  theatre: { label: "Théâtre", color: "#8B5CF6", icon: "🎭" },
  musique: { label: "Musique", color: "#3B82F6", icon: "🎵" },
  debats: { label: "Débats", color: "#22C55E", icon: "💬" },
  street: { label: "Street Art", color: "#EAB308", icon: "🎪" },
  litterature: { label: "Littérature", color: "#A855F7", icon: "📚" },
  immersif: { label: "Immersif", color: "#EC4899", icon: "✨" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
