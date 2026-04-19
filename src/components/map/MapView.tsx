"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import FloatingHeader from "@/components/layout/FloatingHeader";
import BottomTabs from "@/components/layout/BottomTabs";
import {
  type ParisEvent,
  getEventCover,
  categorizeEvent,
  getPriceLabel,
  isFixedVenue,
} from "@/lib/paris-opendata";

const CATEGORY_COLORS: Record<string, string> = {
  expo: "#2563EB", theatre: "#8B5CF6", musique: "#3B82F6", debats: "#22C55E",
  street: "#EAB308", litterature: "#A855F7", immersif: "#EC4899",
  famille: "#F97316", cinema: "#6366F1", autre: "#6B7280",
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

async function fetchEventsFromBrowser(): Promise<ParisEvent[]> {
  const now = new Date().toISOString().split("T")[0];
  const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=100&where=${encodeURIComponent(`date_end>="${now}" AND lat_lon IS NOT NULL`)}&order_by=${encodeURIComponent("date_start ASC")}&timezone=${encodeURIComponent("Europe/Paris")}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

interface Props {
  initialEvents: ParisEvent[];
}

export default function MapView({ initialEvents }: Props) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<ParisEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<ParisEvent | null>(null);
  const [status, setStatus] = useState("Loading...");
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  useEffect(() => {
    const container = mapDiv.current;
    if (!container) return;
    container.innerHTML = "";

    // Load CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css";
      document.head.appendChild(css);
    }

    async function init() {
      // Load Mapbox JS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).mapboxgl) {
        await new Promise<void>((resolve, reject) => {
          const js = document.createElement("script");
          js.src = "https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js";
          js.onload = () => resolve();
          js.onerror = () => reject("Mapbox script failed");
          document.head.appendChild(js);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

      const map = new mapboxgl.Map({
        container: container!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [2.3522, 48.8566],
        zoom: 12,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: true }), "bottom-right");

      await new Promise<void>(r => map.on("load", r));

      // Apply soft blue theme — override base style colors after load
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layers = (map.getStyle().layers || []) as any[];
        layers.forEach((layer) => {
          const id = layer.id as string;
          const type = layer.type as string;
          if (type === "background") {
            map.setPaintProperty(id, "background-color", "#E6F0FB");
          } else if (type === "fill") {
            // Land / landcover / landuse — soft blue tint
            if (id.includes("land") || id.includes("national-park") || id.includes("pitch")) {
              map.setPaintProperty(id, "fill-color", "#EAF3FC");
            } else if (id.includes("building")) {
              map.setPaintProperty(id, "fill-color", "#FFFFFF");
              map.setPaintProperty(id, "fill-opacity", 0.85);
            } else if (id.includes("water")) {
              map.setPaintProperty(id, "fill-color", "#C7DEF4");
            }
          } else if (type === "line") {
            if (id.includes("road") || id.includes("street")) {
              map.setPaintProperty(id, "line-color", "#FFFFFF");
            } else if (id.includes("water")) {
              map.setPaintProperty(id, "line-color", "#A8C7E8");
            }
          }
        });
      } catch (err) {
        console.warn("Map theme override failed:", err);
      }

      // Fetch all events
      let evts = initialEvents;
      if (!evts || evts.length === 0) {
        setStatus("Chargement des événements…");
        evts = await fetchEventsFromBrowser();
      }

      // Filter to only admin-approved events — use cache for fast re-mount
      let approved: Set<string>;
      try {
        const cached = sessionStorage.getItem("lumina_approved_ids");
        if (cached) {
          approved = new Set(JSON.parse(cached));
        } else {
          const res = await fetch("/api/events/curation?approved=true");
          const data = await res.json();
          const ids = (data.items || []).map((r: { externalId: string }) => r.externalId);
          approved = new Set(ids);
          sessionStorage.setItem("lumina_approved_ids", JSON.stringify(ids));
        }
        // Refresh cache in background
        fetch("/api/events/curation?approved=true").then(r => r.json()).then(data => {
          const ids = (data.items || []).map((r: { externalId: string }) => r.externalId);
          sessionStorage.setItem("lumina_approved_ids", JSON.stringify(ids));
        }).catch(() => {});
      } catch { approved = new Set(); }

      const filtered = approved.size > 0 ? evts.filter(e => approved.has(e.id)) : [];
      setEvents(filtered);

      if (filtered.length === 0) {
        setStatus("no-approved");
        return;
      }
      setStatus("");

      // ── Popularity scoring ──
      const WELL_KNOWN_VENUES = [
        "louvre", "pompidou", "orsay", "philharmonie", "opéra", "opera",
        "palais de tokyo", "grand palais", "petit palais", "monnaie",
        "fondation", "institut", "musée", "theatre", "théâtre",
        "conservatoire", "cinémathèque", "bnf", "palais", "comédie",
        "châtelet", "odéon", "bouffes", "athénée", "centre pompidou",
      ];
      function popScore(event: ParisEvent): number {
        let s = 0;
        if (isFixedVenue(event)) s += 10;
        if (getEventCover(event)) s += 8;
        const name = (event.address_name || "").toLowerCase();
        if (WELL_KNOWN_VENUES.some((kw) => name.includes(kw))) s += 20;
        if (event.price_type === "gratuit") s += 2;
        if (event.lead_text && event.lead_text.length > 100) s += 1;
        return s;
      }

      function isSameDay(dateStr: string | null): boolean {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      }

      // ── Dual-state marker: full view (squircle+title) OR tiny dot ──
      interface MarkerRecord {
        event: ParisEvent;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        marker: any;
        score: number;
        fullView: HTMLElement;
        dotView: HTMLElement;
      }

      function buildMarkerDom(event: ParisEvent) {
        const cover = getEventCover(event);
        const fixed = isFixedVenue(event);
        const today = isSameDay(event.date_start);

        // Wrapper is a zero-size anchor point. All children positioned absolutely
        // relative to the wrapper origin (which Mapbox places at the geo coord).
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `position:relative;width:0;height:0;cursor:pointer;`;

        // ── FULL VIEW — scales from wrapper origin (geo coord) ──
        // Squircle is centered EXACTLY on geo coord; title extends below.
        // When scale→0, everything collapses into the geo point.
        const fullView = document.createElement("div");
        fullView.style.cssText = `
          position:absolute;left:0;top:0;width:0;height:0;
          transform:scale(0);opacity:0;
          transform-origin:0 0;
          transition:transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease-out;
          pointer-events:none;
        `;

        // Squircle wrapper — doesn't clip, so date indicator can overflow outside
        const squircleBox = document.createElement("div");
        squircleBox.style.cssText = `
          position:absolute;left:-33px;top:-33px;width:66px;height:66px;
        `;

        // Inner image box — this one clips the image to rounded corners
        const imgBox = document.createElement("div");
        imgBox.style.cssText = `
          position:absolute;inset:0;
          border-radius:18px;overflow:hidden;
          background:#fff;border:1.5px solid #9ca3af;
          box-shadow:0 4px 14px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.08);
          pointer-events:auto;
        `;
        if (cover) {
          const img = document.createElement("img");
          img.src = cover;
          img.loading = "lazy";
          img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
          imgBox.appendChild(img);
        } else {
          imgBox.style.cssText += "display:flex;align-items:center;justify-content:center;background:#f3f4f6;";
          const icon = document.createElement("span");
          icon.textContent = fixed ? "🏛" : "🎭";
          icon.style.cssText = "font-size:28px;opacity:0.6;";
          imgBox.appendChild(icon);
        }
        squircleBox.appendChild(imgBox);

        // Date indicator — sibling of imgBox, NOT clipped. Sticks out from top-right.
        const dateIndicator = document.createElement("div");
        dateIndicator.style.cssText = `
          position:absolute;top:-7px;right:-7px;
          width:16px;height:16px;border-radius:50%;
          background:${today ? "#22c55e" : "#9ca3af"};
          border:2.5px solid #fff;
          box-shadow:0 2px 5px rgba(0,0,0,0.3);
          pointer-events:none;
        `;
        squircleBox.appendChild(dateIndicator);

        fullView.appendChild(squircleBox);

        // Title — below squircle (at y=39, which is 33 + 6 gap)
        const titleEl = document.createElement("span");
        const t = event.title || event.address_name || "";
        titleEl.textContent = t.length > 26 ? t.slice(0, 24) + "…" : t;
        titleEl.style.cssText = `
          position:absolute;top:39px;left:50%;transform:translateX(-50%);
          padding:0 4px;max-width:120px;text-align:center;
          font-family:Georgia, 'Times New Roman', serif;
          font-style:italic;font-weight:700;
          font-size:11px;color:#1f2937;line-height:1.2;
          text-shadow:0 1px 2px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.9);
          pointer-events:none;
          white-space:nowrap;
        `;
        fullView.appendChild(titleEl);

        wrapper.appendChild(fullView);

        // ── DOT VIEW — centered on wrapper origin (geo coord) ──
        // Same exact position where the squircle was centered, so the
        // transition is visually "where the squircle was, a dot appears".
        const dotView = document.createElement("div");
        dotView.style.cssText = `
          position:absolute;top:-5px;left:-5px;
          width:10px;height:10px;border-radius:50%;
          background:${today ? "#22c55e" : "#fff"};
          box-shadow:0 1px 4px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(0,0,0,0.12);
          transform:scale(0);opacity:0;
          transform-origin:center;
          transition:transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease-out;
          pointer-events:auto;
        `;
        wrapper.appendChild(dotView);

        return { wrapper, fullView, dotView };
      }

      const geoEvents = filtered.filter((e) => e.lat_lon);
      const markerRecords: MarkerRecord[] = [];

      geoEvents.forEach((event) => {
        const { wrapper, fullView, dotView } = buildMarkerDom(event);
        wrapper.onclick = (e) => {
          e.stopPropagation();
          setSelectedEvent(event);
          map.flyTo({ center: [event.lat_lon!.lon, event.lat_lon!.lat], zoom: Math.max(map.getZoom(), 15), duration: 600 });
        };
        const marker = new mapboxgl.Marker({ element: wrapper, anchor: "center" })
          .setLngLat([event.lat_lon!.lon, event.lat_lon!.lat])
          .addTo(map);
        markerRecords.push({ event, marker, score: popScore(event), fullView, dotView });
      });

      // Sort by popularity desc — highest score gets priority for full view
      markerRecords.sort((a, b) => b.score - a.score);

      type Mode = "full" | "dot" | "hidden";
      // Pop-IN: gentle spring, moderate speed
      const POP_IN = "transform 0.55s cubic-bezier(0.25, 0.8, 0.3, 1.05), opacity 0.35s ease-out";
      // Pop-OUT: slow, smooth deceleration — no overshoot
      const POP_OUT = "transform 0.7s cubic-bezier(0.33, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

      function setMode(rec: MarkerRecord, mode: Mode) {
        const { fullView, dotView } = rec;
        const markerEl = rec.marker.getElement() as HTMLElement;
        if (mode === "full") {
          markerEl.style.zIndex = "10"; // full markers above dots
          fullView.style.transition = POP_IN;
          fullView.style.transform = "scale(1)";
          fullView.style.opacity = "1";
          fullView.style.pointerEvents = "auto";
          dotView.style.transition = POP_OUT;
          dotView.style.transform = "scale(0)";
          dotView.style.opacity = "0";
          dotView.style.pointerEvents = "none";
        } else if (mode === "dot") {
          markerEl.style.zIndex = "1"; // dots in the background
          fullView.style.transition = POP_OUT;
          fullView.style.transform = "scale(0)";
          fullView.style.opacity = "0";
          fullView.style.pointerEvents = "none";
          dotView.style.transition = POP_IN;
          dotView.style.transform = "scale(1)";
          dotView.style.opacity = "1";
          dotView.style.pointerEvents = "auto";
        } else {
          markerEl.style.zIndex = "0";
          fullView.style.transition = POP_OUT;
          fullView.style.transform = "scale(0)";
          fullView.style.opacity = "0";
          dotView.style.transition = POP_OUT;
          dotView.style.transform = "scale(0)";
          dotView.style.opacity = "0";
        }
      }

      // ── Decide mode for each marker based on zoom + overlap ──
      function updateVisibility() {
        const zoom = map.getZoom();
        // How many full markers can show at each zoom (generous)
        const maxFull = zoom < 10 ? 12 : zoom < 11 ? 25 : zoom < 12 ? 55 : zoom < 13 ? 120 : 9999;
        // Pixel threshold for full-marker overlap (full markers hide each other)
        const fullThreshold = zoom < 11 ? 100 : zoom < 13 ? 80 : 65;
        // Pixel threshold for dot overlap (much smaller — dots are tiny)
        const dotThreshold = 18;

        const placedFull: { x: number; y: number }[] = [];
        const placedDots: { x: number; y: number }[] = [];

        for (const rec of markerRecords) {
          if (!rec.event.lat_lon) { setMode(rec, "hidden"); continue; }
          const p = map.project([rec.event.lat_lon.lon, rec.event.lat_lon.lat]);

          let canBeFull = placedFull.length < maxFull;
          if (canBeFull) {
            for (const pf of placedFull) {
              const dx = p.x - pf.x, dy = p.y - pf.y;
              if (Math.sqrt(dx * dx + dy * dy) < fullThreshold) { canBeFull = false; break; }
            }
          }

          if (canBeFull) {
            setMode(rec, "full");
            placedFull.push({ x: p.x, y: p.y });
          } else {
            // Check dot overlap — skip if too close to existing dot/full
            let dotOverlaps = false;
            for (const pd of placedDots) {
              const dx = p.x - pd.x, dy = p.y - pd.y;
              if (Math.sqrt(dx * dx + dy * dy) < dotThreshold) { dotOverlaps = true; break; }
            }
            if (dotOverlaps) {
              setMode(rec, "hidden");
            } else {
              setMode(rec, "dot");
              placedDots.push({ x: p.x, y: p.y });
            }
          }
        }
      }

      // Initial render — trigger pop-in animation from scale 0
      requestAnimationFrame(updateVisibility);
      map.on("zoomend", updateVisibility);
      map.on("moveend", updateVisibility);

      setStatus("");
      console.log("Rendered", markerRecords.length, "markers");
    }

    init().catch(err => {
      console.error("Map init failed:", err);
      setStatus("Error: " + String(err));
    });
  }, [initialEvents]);

  return (
    <>
      <div ref={mapDiv} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />

      {status === "no-approved" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
          <div style={{ background: "rgba(15,15,18,0.92)", backdropFilter: "blur(20px)", borderRadius: 24, padding: "32px 28px", textAlign: "center", maxWidth: 300, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              {isAdmin ? "Carte vide" : "Bientôt disponible"}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: "1.6", marginBottom: isAdmin ? 20 : 0 }}>
              {isAdmin
                ? "Aucun événement approuvé. Sélectionnez des événements dans la curation."
                : "Nos équipes préparent la sélection d'événements. Revenez bientôt !"}
            </p>
            {isAdmin && (
              <a href="/admin/curation" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 14, background: "linear-gradient(135deg,#2563EB,#60A5FA)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", pointerEvents: "all" }}>
                Aller à la curation →
              </a>
            )}
          </div>
        </div>
      )}
      {status && status !== "no-approved" && (
        <div style={{ position: "fixed", top: 80, left: 16, right: 16, zIndex: 100, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 12, padding: 12, borderRadius: 12 }}>
          {status}
        </div>
      )}

      <FloatingHeader />

      <div className="fixed z-40 left-0 right-0 overflow-x-auto no-scrollbar" style={{ top: "calc(68px + var(--safe-top))" }}>
        <div className="flex gap-2 px-4 py-2">
          {[
            { label: "Tous", icon: "✨" }, { label: "Expos", icon: "🎨" }, { label: "Théâtre", icon: "🎭" },
            { label: "Musique", icon: "🎵" }, { label: "Débats", icon: "💬" }, { label: "Littérature", icon: "📚" },
            { label: "Cinéma", icon: "🎬" }, { label: "Famille", icon: "👨‍👩‍👧" },
          ].map((cat) => (
            <button key={cat.label} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {events.length > 0 && status === "" && (
        <div className="fixed z-40 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-full px-3 py-1 shadow-md text-xs font-medium text-gray-600" style={{ top: "calc(110px + var(--safe-top))" }}>
          {events.length} événement{events.length > 1 ? "s" : ""}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed z-50 left-4 right-4 bg-white rounded-2xl shadow-xl overflow-hidden" style={{ bottom: "calc(90px + var(--safe-bottom))" }}>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedEvent(null); }} className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white text-sm">✕</button>
          <Link href={`/events/${encodeURIComponent(selectedEvent.id)}`} className="flex" style={{ textDecoration: "none", color: "inherit" }}>
            {getEventCover(selectedEvent) && (
              <div className="w-28 shrink-0"><img src={getEventCover(selectedEvent)!} alt="" className="w-full h-full object-cover" style={{ minHeight: 120 }} /></div>
            )}
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: CATEGORY_COLORS[categorizeEvent(selectedEvent.tags, selectedEvent.qfap_tags)] || "#6B7280" }}>
                  {categorizeEvent(selectedEvent.tags, selectedEvent.qfap_tags)}
                </span>
                {selectedEvent.price_type && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedEvent.price_type === "gratuit" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {getPriceLabel(selectedEvent.price_type)}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold leading-tight mb-1 line-clamp-2">{selectedEvent.title}</h3>
              {selectedEvent.lead_text && <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">{selectedEvent.lead_text}</p>}
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                {selectedEvent.date_start && <span>{formatDate(selectedEvent.date_start)}</span>}
                {selectedEvent.address_name && <span className="truncate">📍 {selectedEvent.address_name}</span>}
              </div>
            </div>
          </Link>
        </div>
      )}

      <BottomTabs />
    </>
  );
}
