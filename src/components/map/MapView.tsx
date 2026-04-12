"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
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
  expo: "#E85D3A", theatre: "#8B5CF6", musique: "#3B82F6", debats: "#22C55E",
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

      // Fetch all events
      let evts = initialEvents;
      if (!evts || evts.length === 0) {
        setStatus("Chargement des événements…");
        evts = await fetchEventsFromBrowser();
      }

      // Filter to only admin-approved events (from Supabase via API)
      let approved: Set<string>;
      try {
        const res = await fetch("/api/events/curation?approved=true");
        const data = await res.json();
        approved = new Set((data.items || []).map((r: { externalId: string }) => r.externalId));
      } catch { approved = new Set(); }

      const filtered = approved.size > 0 ? evts.filter(e => approved.has(e.id)) : [];
      setEvents(filtered);

      if (filtered.length === 0) {
        setStatus("no-approved");
        return;
      }
      setStatus("");

      // Inject animation styles once
      if (!document.getElementById("marker-animations")) {
        const style = document.createElement("style");
        style.id = "marker-animations";
        style.textContent = `
          @keyframes markerPop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.12); opacity: 1; }
            80% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
          }
          .marker-inner {
            animation: markerPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
          }
        `;
        document.head.appendChild(style);
      }

      // Add markers one by one with staggered setTimeout
      let count = 0;
      let fixedCount = 0;
      let ephemeralCount = 0;

      function addMarker(event: ParisEvent, delay: number) {
        setTimeout(() => {
        if (!event.lat_lon) return;
        const category = categorizeEvent(event.tags, event.qfap_tags);
        const color = CATEGORY_COLORS[category] || "#6B7280";
        const cover = getEventCover(event);
        const fixed = isFixedVenue(event);

        const wrapper = document.createElement("div");
        wrapper.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
        // Inner div for animation — doesn't interfere with Mapbox positioning
        const inner = document.createElement("div");
        inner.className = "marker-inner";
        inner.style.cssText = "display:flex;flex-direction:column;align-items:center;";

        const imgBox = document.createElement("div");

        if (fixed) {
          // FIXED VENUE — larger square marker with thick border, building icon style
          if (cover) {
            imgBox.style.cssText = `width:52px;height:52px;border-radius:14px;overflow:hidden;border:3.5px solid ${color};background:#fff;box-shadow:0 3px 12px rgba(0,0,0,0.3);`;
            const img = document.createElement("img");
            img.src = cover;
            img.loading = "lazy";
            img.style.cssText = "width:100%;height:100%;object-fit:cover;";
            imgBox.appendChild(img);
          } else {
            imgBox.style.cssText = `width:36px;height:36px;border-radius:10px;background:${color};border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;`;
            const icon = document.createElement("span");
            icon.textContent = "🏛";
            icon.style.cssText = "font-size:16px;";
            imgBox.appendChild(icon);
          }
          fixedCount++;
        } else {
          // EPHEMERAL EVENT — smaller round dot or small image
          if (cover) {
            imgBox.style.cssText = `width:38px;height:38px;border-radius:50%;overflow:hidden;border:2.5px solid ${color};background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);`;
            const img = document.createElement("img");
            img.src = cover;
            img.loading = "lazy";
            img.style.cssText = "width:100%;height:100%;object-fit:cover;";
            imgBox.appendChild(img);
          } else {
            imgBox.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.25);`;
          }
          ephemeralCount++;
        }

        inner.appendChild(imgBox);

        // Label — only for fixed venues (always) or ephemeral with cover
        if (fixed || cover) {
          const arrow = document.createElement("div");
          arrow.style.cssText = `width:${fixed ? 10 : 7}px;height:${fixed ? 10 : 7}px;background:${color};transform:rotate(45deg);margin-top:-${fixed ? 6 : 4}px;`;
          inner.appendChild(arrow);
          const lbl = document.createElement("div");
          lbl.style.cssText = `margin-top:-2px;background:#fff;border-radius:6px;padding:${fixed ? "2px 6px" : "1px 5px"};box-shadow:0 1px 3px rgba(0,0,0,0.12);max-width:${fixed ? 120 : 100}px;text-align:center;`;
          const txt = document.createElement("span");
          const t = event.address_name || event.title;
          txt.textContent = t.length > 20 ? t.slice(0, 18) + "…" : t;
          txt.style.cssText = `font-size:${fixed ? 10 : 9}px;font-weight:${fixed ? 700 : 600};color:#1f2937;line-height:1.3;display:block;white-space:nowrap;`;
          lbl.appendChild(txt);

          if (fixed) {
            const sub = document.createElement("span");
            sub.textContent = "Lieu permanent";
            sub.style.cssText = "font-size:7px;color:#9ca3af;display:block;";
            lbl.appendChild(sub);
          }

          inner.appendChild(lbl);
        }

        wrapper.appendChild(inner);

        wrapper.onclick = (e) => {
          e.stopPropagation();
          setSelectedEvent(event);
          map.flyTo({ center: [event.lat_lon!.lon, event.lat_lon!.lat], zoom: Math.max(map.getZoom(), 15), duration: 600 });
        };

        new mapboxgl.Marker({ element: wrapper, anchor: "bottom" })
          .setLngLat([event.lat_lon.lon, event.lat_lon.lat])
          .addTo(map);
        count++;
        }, delay);
      }

      // Launch markers one by one
      const geoEvents = filtered.filter(e => e.lat_lon);
      geoEvents.forEach((event, i) => {
        addMarker(event, i * 50); // 50ms between each pop
        if (isFixedVenue(event)) fixedCount++; else ephemeralCount++;
      });

      setStatus("");
      console.log("Animating", geoEvents.length, "markers —", fixedCount, "fixed,", ephemeralCount, "ephemeral");
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
              <a href="/admin/curation" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 14, background: "linear-gradient(135deg,#E85D3A,#f07a5a)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", pointerEvents: "all" }}>
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
          <button onClick={() => setSelectedEvent(null)} className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white text-sm">✕</button>
          <div className="flex">
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
          </div>
        </div>
      )}

      <BottomTabs />
    </>
  );
}
