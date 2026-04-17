"use client";

import { useEffect, useState, useCallback } from "react";
import MobileShell from "@/components/layout/MobileShell";
import { type ParisEvent, getEventCover, categorizeEvent, getPriceLabel } from "@/lib/paris-opendata";
import Link from "next/link";

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));
}
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function trendingScore(event: ParisEvent): number {
  let s = 0;
  if (getEventCover(event)) s += 3;
  if (event.price_type === "gratuit") s += 2;
  if (event.date_start) {
    const d = (new Date(event.date_start).getTime() - Date.now()) / 86400000;
    if (d >= 0 && d <= 3) s += 5; else if (d <= 7) s += 3; else if (d <= 14) s += 1;
  }
  if (event.lead_text && event.lead_text.length > 80) s += 1;
  return s;
}
function getPreferredCats(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("lumina_preferred_cats") || "[]"); } catch { return []; }
}

function EventCard({ event, km }: { event: ParisEvent; km?: number }) {
  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("lumina_saved_events") || "[]");
      setSaved(list.some((e: { externalId: string }) => e.externalId === event.id));
    } catch {}
  }, [event.id]);
  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const list: { externalId: string }[] = JSON.parse(localStorage.getItem("lumina_saved_events") || "[]");
    if (saved) {
      localStorage.setItem("lumina_saved_events", JSON.stringify(list.filter((x) => x.externalId !== event.id)));
      setSaved(false);
    } else {
      localStorage.setItem("lumina_saved_events", JSON.stringify([...list, { externalId: event.id, title: event.title, coverUrl: getEventCover(event), dateStart: event.date_start, addressName: event.address_name, category: categorizeEvent(event.tags, event.qfap_tags), priceType: event.price_type, savedAt: new Date().toISOString() }]));
      setSaved(true);
    }
  };
  return (
    <Link href={`/events/${encodeURIComponent(event.id)}`} className="block bg-white rounded-2xl overflow-hidden active:scale-[0.97] transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      <div className="relative" style={{ aspectRatio: "16/10", background: "#f3f4f6" }}>
        {cover ? <img src={cover} alt={event.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100"><span className="text-3xl opacity-30">🎭</span></div>}
        {event.price_type === "gratuit" && <span className="absolute top-2 left-2 text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">Gratuit</span>}
        {km !== undefined && <span className="absolute top-2 right-8 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>{km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`}</span>}
        <button onClick={toggleSave} className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-all" style={{ background: "rgba(255,255,255,0.9)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "#2563EB" : "none"} stroke={saved ? "#2563EB" : "#6b7280"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
      </div>
      <div className="p-2.5">
        <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{category}</span>
        <h3 className="text-xs font-bold leading-tight line-clamp-2 mt-0.5 mb-1">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          {event.date_start && <span>{formatDate(event.date_start)}</span>}
          {event.address_name && <span className="truncate">· {event.address_name}</span>}
        </div>
      </div>
    </Link>
  );
}

type Tab = "pour-toi" | "autour" | "tendances";

export default function EventsPage() {
  const [all, setAll] = useState<ParisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pour-toi");
  const [loc, setLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/events?limit=100").then(r => r.json()),
      fetch("/api/events/curation?approved=true").then(r => r.json()),
    ])
      .then(([eventsData, curationData]) => {
        const events: ParisEvent[] = eventsData.events || [];
        const approved = new Set<string>((curationData.items || []).map((r: { externalId: string }) => r.externalId));
        setAll(approved.size > 0 ? events.filter(e => approved.has(e.id)) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const requestLoc = useCallback(() => {
    setLocLoading(true); setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }); setLocLoading(false); },
      () => { setLocError(true); setLocLoading(false); }, { timeout: 8000 }
    );
  }, []);

  useEffect(() => { if (tab === "autour" && !loc && !locLoading && !locError) requestLoc(); }, [tab, loc, locLoading, locError, requestLoc]);

  const pourToi = useCallback(() => {
    const prefs = getPreferredCats();
    if (!prefs.length) return all;
    return [...all].sort((a, b) => (prefs.includes(categorizeEvent(b.tags, b.qfap_tags)) ? 1 : 0) - (prefs.includes(categorizeEvent(a.tags, a.qfap_tags)) ? 1 : 0));
  }, [all]);

  const autour = useCallback(() => {
    if (!loc) return [];
    return all.filter(e => e.lat_lon).map(e => ({ event: e, km: haversineKm(loc.lat, loc.lon, e.lat_lon!.lat, e.lat_lon!.lon) })).sort((a, b) => a.km - b.km);
  }, [all, loc]);

  const tendances = useCallback(() => [...all].sort((a, b) => trendingScore(b) - trendingScore(a)), [all]);

  const TABS = [
    { key: "pour-toi" as Tab, label: "Pour toi", emoji: "✦" },
    { key: "autour" as Tab, label: "Autour de toi", emoji: "📍" },
    { key: "tendances" as Tab, label: "Tendances", emoji: "🔥" },
  ];

  return (
    <MobileShell>
      <div className="pb-4">
        <div className="px-4 pt-3 pb-3"><h1 className="text-xl font-bold text-gray-900">Événements</h1></div>
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
              style={tab === t.key ? { background: "#1f2937", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" } : { background: "#f3f4f6", color: "#6b7280" }}>
              <span style={{ fontSize: 11 }}>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {tab === "pour-toi" && <div className="px-4 grid grid-cols-2 gap-3">{pourToi().map(e => <EventCard key={e.id} event={e} />)}</div>}
            {tab === "autour" && (
              <div className="px-4">
                {locLoading && <div className="flex flex-col items-center py-16 gap-3"><div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" /><p className="text-sm text-gray-400">Localisation en cours…</p></div>}
                {locError && !locLoading && (
                  <div className="text-center py-14 px-4">
                    <div className="text-4xl mb-3">📍</div>
                    <p className="text-sm font-semibold text-gray-700">Localisation refusée</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Autorisez l'accès à votre position</p>
                    <button onClick={requestLoc} className="px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: "#2563EB" }}>Réessayer</button>
                  </div>
                )}
                {!locLoading && !locError && loc && <div className="grid grid-cols-2 gap-3">{autour().map(({ event, km }) => <EventCard key={event.id} event={event} km={km} />)}</div>}
              </div>
            )}
            {tab === "tendances" && (
              <div className="px-4">
                <div className="space-y-3 mb-4">
                  {tendances().slice(0, 3).map((event, i) => {
                    const cover = getEventCover(event);
                    return (
                      <Link key={event.id} href={`/events/${encodeURIComponent(event.id)}`} className="flex gap-3 bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                        <div className="w-24 shrink-0 relative" style={{ minHeight: 80, background: "#f3f4f6" }}>
                          {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🎭</div>}
                          <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: ["#EAB308","#9CA3AF","#D97706"][i] }}>{i + 1}</div>
                        </div>
                        <div className="flex-1 p-3 min-w-0">
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{categorizeEvent(event.tags, event.qfap_tags)}</span>
                          <h3 className="text-sm font-bold leading-tight line-clamp-2 mt-0.5">{event.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                            {event.date_start && <span>{formatDate(event.date_start)}</span>}
                            {event.price_type && <span className={event.price_type === "gratuit" ? "text-green-600 font-semibold" : ""}>{getPriceLabel(event.price_type)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">{tendances().slice(3).map(e => <EventCard key={e.id} event={e} />)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
