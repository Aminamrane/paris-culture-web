"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  type ParisEvent,
  getEventCover,
  categorizeEvent,
} from "@/lib/paris-opendata";

const BLUE = "#2563EB";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(dateStr));
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getUserLocation(): { lat: number; lon: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("lumina_user_location");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface EventNote {
  id: string;
  user_id: string;
  user_name: string | null;
  note: string;
  created_at: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<ParisEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const [saved, setSaved] = useState(false);
  const [visited, setVisited] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [notes, setNotes] = useState<EventNote[]>([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showVisitedPopup, setShowVisitedPopup] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Pull-to-dismiss
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullYRef = useRef(0);

  useEffect(() => {
    setUserLocation(getUserLocation());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [evtRes, savedRes, visitedRes, statsRes] = await Promise.all([
          fetch(`/api/events/detail?id=${encodeURIComponent(params.id as string)}`),
          fetch(`/api/events/save?externalId=${encodeURIComponent(params.id as string)}`),
          fetch(`/api/events/visited?externalId=${encodeURIComponent(params.id as string)}`),
          fetch(`/api/events/stats?externalId=${encodeURIComponent(params.id as string)}`),
        ]);
        const evtData = await evtRes.json();
        setEvent(evtData.event || null);
        setSaved(!!(await savedRes.json()).saved);
        setVisited(!!(await visitedRes.json()).visited);
        const stats = await statsRes.json();
        setSavedCount(stats.savedCount || 0);
        setNotes(stats.notes || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [params.id]);

  // Pull-to-dismiss listeners
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onTouchStart(e: TouchEvent) {
      if (el!.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return;
      if (el!.scrollTop > 0) {
        pulling.current = false;
        pullYRef.current = 0;
        setPullY(0);
        return;
      }
      const dy = Math.max(0, e.touches[0].clientY - startY.current);
      if (dy > 5) e.preventDefault();
      const dampened = dy * 0.45;
      pullYRef.current = dampened;
      setPullY(dampened);
    }
    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullYRef.current > 100) {
        router.back();
      } else {
        pullYRef.current = 0;
        setPullY(0);
      }
    }
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  const distance = useMemo(() => {
    if (!event?.lat_lon || !userLocation) return null;
    return haversineKm(userLocation.lat, userLocation.lon, event.lat_lon.lat, event.lat_lon.lon);
  }, [event, userLocation]);

  const toggleSave = useCallback(async () => {
    if (!session?.user?.id || !event) {
      router.push("/login");
      return;
    }
    const next = !saved;
    setSaved(next);
    setSavedCount((c) => c + (next ? 1 : -1));
    if (next) {
      await fetch("/api/events/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: event.id,
          eventTitle: event.title,
          eventCover: getEventCover(event),
          eventVenue: event.address_name,
          eventDate: event.date_start,
        }),
      });
    } else {
      await fetch("/api/events/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: event.id, action: "remove" }),
      });
    }
  }, [saved, event, session, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">Événement non trouvé</p>
        <button onClick={() => router.back()} className="text-[#2563EB] text-sm font-medium">
          ← Retour
        </button>
      </div>
    );
  }

  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);
  const description = event.description ? stripHtml(event.description) : null;
  const days = event.date_start ? daysUntil(event.date_start) : null;
  const progress = Math.min(pullY / 100, 1);

  return (
    <>
      {/* Fixed top bar */}
      <button
        onClick={() => router.back()}
        className="fixed z-[100] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        style={{ top: "calc(12px + var(--safe-top))", left: 16 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        className="fixed z-[100] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
        style={{ top: "calc(12px + var(--safe-top))", right: 16 }}
        onClick={() => {
          if (navigator.share) navigator.share({ title: event.title, url: window.location.href });
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {/* Pull indicator */}
      {pullY > 10 && (
        <div className="fixed top-0 left-0 right-0 z-[90] flex justify-center" style={{ paddingTop: Math.min(pullY * 0.3, 40), pointerEvents: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: progress >= 1 ? BLUE : "rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${0.5 + progress * 0.5})`,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={progress >= 1 ? "#fff" : "#999"} strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* Main scrollable content */}
      <div
        ref={scrollRef}
        className="fixed inset-0 z-50 bg-white overflow-y-auto no-scrollbar"
        style={{
          transform: pullY > 0 ? `translateY(${pullY}px)` : undefined,
          borderRadius: pullY > 0 ? `${Math.min(pullY * 0.25, 20)}px` : undefined,
          overscrollBehavior: "none",
          paddingBottom: "calc(110px + var(--safe-bottom))",
        }}
      >
        {/* Cover image with soft background */}
        <div style={{ background: "linear-gradient(180deg, #f3f4f6 0%, #ffffff 100%)", padding: "calc(68px + var(--safe-top)) 20px 16px", display: "flex", justifyContent: "center" }}>
          {cover ? (
            <div style={{ width: "100%", maxWidth: 320, aspectRatio: "4/5", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <img src={cover} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 320, aspectRatio: "4/5", borderRadius: 12, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>🎭</div>
          )}
        </div>

        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-3">
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.15)" }} />
        </div>

        <div className="px-5">
          {/* Title — big italic bold uppercase */}
          <h1 style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            fontWeight: 900, fontStyle: "italic", fontSize: 32,
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "#111",
            textTransform: "uppercase",
            marginBottom: 14,
          }}>
            {event.title}
          </h1>

          {/* Subtitle (lead text = often artists/performers) */}
          {event.lead_text && (
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 14 }}>
              {stripHtml(event.lead_text)}
            </p>
          )}

          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 999, border: "1.5px solid #d1d5db", color: "#374151", textTransform: "capitalize" }}>
              {category}
            </span>
            {event.price_type === "gratuit" && (
              <span style={{ fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 999, border: "1.5px solid #86efac", color: "#16a34a" }}>
                Gratuit
              </span>
            )}
          </div>

          {/* Venue + distance */}
          {event.address_name && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
                  {event.address_name}
                  {distance !== null && (
                    <span style={{ color: "#6b7280", fontWeight: 500 }}> · {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Date info */}
          {event.date_start && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: "#111" }} />
              <p style={{ fontSize: 14, color: "#111" }}>
                {days !== null && days >= 0 && (
                  <>
                    <span style={{ fontWeight: 700 }}>{days === 0 ? "Aujourd'hui" : days === 1 ? "Demain" : `Dans ${days} jours`}</span>
                    {event.date_start && <span style={{ color: "#6b7280" }}> · {formatTime(event.date_start)}</span>}
                  </>
                )}
                {days !== null && days < 0 && event.date_end && daysUntil(event.date_end) >= 0 && (
                  <span style={{ fontWeight: 700 }}>
                    {daysUntil(event.date_end) === 0 ? "Dernier jour !" : `Plus que ${daysUntil(event.date_end)} jours`}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Saved by X members */}
          {savedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingTop: 4 }}>
              <div style={{ display: "flex" }}>
                {Array.from({ length: Math.min(savedCount, 3) }).map((_, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: ["#c7d2fe", "#fecaca", "#fde68a"][i % 3],
                    border: "2px solid #fff",
                    marginLeft: i === 0 ? 0 : -8,
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#374151" }}>
                Enregistré par <span style={{ fontWeight: 700 }}>{savedCount} membre{savedCount > 1 ? "s" : ""}</span>
              </p>
            </div>
          )}

          <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0 18px" }} />

          {/* About with See more */}
          {description && (
            <Section title="À propos">
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {descExpanded || description.length < 220 ? description : description.slice(0, 200).trimEnd() + "…"}
              </p>
              {description.length >= 220 && (
                <button
                  onClick={() => setDescExpanded((e) => !e)}
                  style={{
                    marginTop: 8, fontSize: 13, fontWeight: 700, color: "#111",
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {descExpanded ? "Voir moins" : "Voir plus"}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: descExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </Section>
          )}

          {/* Price */}
          {(event.price_type || event.price_detail) && (
            <Section title="Tarif">
              {event.price_type === "gratuit" ? (
                <p style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>Gratuit</p>
              ) : (
                <p style={{ fontSize: 14, color: "#374151" }}>
                  {event.price_detail ? stripHtml(event.price_detail) : "Payant"}
                </p>
              )}
            </Section>
          )}

          {/* Place */}
          {(event.address_name || event.address_street) && (
            <Section title="Lieu">
              {event.address_name && <p style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{event.address_name}</p>}
              {event.address_street && (
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  {event.address_street}
                  {event.address_zipcode && `, ${event.address_zipcode}`}
                  {event.address_city && ` ${event.address_city}`}
                </p>
              )}
              {distance !== null && event.lat_lon && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${event.lat_lon.lat},${event.lat_lon.lon}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 8, color: BLUE, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
                >
                  Y aller ({distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`})
                </a>
              )}
            </Section>
          )}

          {/* Transport */}
          {event.transport && (
            <Section title="Transport">
              <p style={{ fontSize: 14, color: "#374151" }}>{stripHtml(event.transport)}</p>
            </Section>
          )}

          {/* Notes (public comments) */}
          <Section title="Notes" right={
            session?.user?.id ? (
              <button
                onClick={() => setShowVisitedPopup(true)}
                style={{ color: BLUE, fontSize: 14, fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                Partager une note
              </button>
            ) : null
          }>
            {notes.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Soyez le premier à partager votre avis après votre visite.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                        @{(n.user_name || "utilisateur").toLowerCase().replace(/[^a-z0-9]/g, "")}
                      </p>
                      <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.45 }}>{n.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* External link */}
          {event.access_link && (
            <Section title="Site de l'événement">
              <a
                href={event.access_link} target="_blank" rel="noopener noreferrer"
                style={{ color: BLUE, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                Ouvrir le site →
              </a>
            </Section>
          )}
        </div>
      </div>

      {/* Fixed bottom bar — Save / Visited */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
          padding: "12px 12px calc(12px + var(--safe-bottom))",
          background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 70%)",
          display: "flex", gap: 10,
        }}
      >
        <button
          onClick={toggleSave}
          style={{
            flex: 1, height: 52, borderRadius: 999,
            background: saved ? BLUE : "#fff",
            color: saved ? "#fff" : BLUE,
            border: `1.5px solid ${BLUE}`,
            fontSize: 15, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            transition: "transform 0.1s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
        <button
          onClick={() => setShowVisitedPopup(true)}
          style={{
            flex: 1, height: 52, borderRadius: 999,
            background: visited ? BLUE : "#fff",
            color: visited ? "#fff" : BLUE,
            border: `1.5px solid ${BLUE}`,
            fontSize: 15, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {visited ? "Visité" : "J'y étais"}
        </button>
      </div>

      {/* Visited / diary popup */}
      {showVisitedPopup && (
        <VisitedPopup
          event={event}
          cover={cover}
          visited={visited}
          onClose={() => setShowVisitedPopup(false)}
          onSaved={(newNote) => {
            setVisited(true);
            if (newNote && session?.user) {
              // Prepend to local notes feed
              setNotes((prev) => [
                {
                  id: `local-${Date.now()}`,
                  user_id: session.user.id,
                  user_name: session.user.name || null,
                  note: newNote,
                  created_at: new Date().toISOString(),
                },
                ...prev,
              ]);
            }
          }}
        />
      )}
    </>
  );
}

/* ── Section wrapper ───────────────────────────────────────────────────────── */
function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 18, paddingBottom: 18, borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ── Visited popup — bottom sheet with date + note ─────────────────────────── */
function VisitedPopup({
  event, cover, visited, onClose, onSaved,
}: {
  event: ParisEvent;
  cover: string | null;
  visited: boolean;
  onClose: () => void;
  onSaved: (note: string | null) => void;
}) {
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const submit = useCallback(async () => {
    setSending(true);
    try {
      await fetch("/api/events/visited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: event.id,
          eventTitle: event.title,
          eventCover: cover,
          eventVenue: event.address_name,
          eventDate: event.date_start,
          visitedOn: date,
          note: note.trim() || null,
        }),
      });
      setConfirmed(true);
      onSaved(note.trim() || null);
    } catch {}
    setSending(false);
  }, [event, cover, date, note, onSaved]);

  const displayDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={sending ? undefined : onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-4 pb-6"
        style={{ paddingBottom: "calc(18px + var(--safe-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db" }} />
        </div>

        {confirmed ? (
          <>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>
                Ajouté à ton journal !
              </h3>
            </div>

            <EventCardMini cover={cover} event={event} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px 0" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Visité le</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111", padding: "6px 14px", background: "#f3f4f6", borderRadius: 999 }}>{displayDate}</span>
            </div>

            <button
              onClick={onClose}
              style={{ width: "100%", height: 52, borderRadius: 999, background: "#111", color: "#fff", fontSize: 15, fontWeight: 800, border: "none", marginTop: 20, cursor: "pointer" }}
            >
              Fermer
            </button>
            <Link
              href="/profile"
              style={{ display: "block", textAlign: "center", padding: "14px 0 0", fontSize: 14, fontWeight: 700, color: "#111", textDecoration: "none" }}
            >
              Aller dans mon journal
            </Link>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 16, textAlign: "center" }}>
              {visited ? "Modifier ton passage" : "Tu y es allé·e ?"}
            </h3>

            <EventCardMini cover={cover} event={event} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 4px 12px" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Visité le</span>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                style={{ fontSize: 14, fontWeight: 700, color: "#111", padding: "6px 12px", background: "#f3f4f6", borderRadius: 999, border: "none", outline: "none" }}
              />
            </div>

            <div style={{ padding: "8px 0" }}>
              <textarea
                placeholder="Partage une note sur cette expo ! (optionnel)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 14, color: "#111",
                  border: "1.5px solid #e5e7eb", borderRadius: 16, outline: "none",
                  fontFamily: "inherit", resize: "none",
                }}
              />
            </div>

            <button
              onClick={submit}
              disabled={sending}
              style={{
                width: "100%", height: 52, borderRadius: 999, background: BLUE, color: "#fff",
                fontSize: 15, fontWeight: 800, border: "none", marginTop: 4, cursor: "pointer",
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? "Envoi..." : visited ? "Mettre à jour" : "Confirmer"}
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              style={{ width: "100%", padding: "14px 0 0", fontSize: 14, fontWeight: 700, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EventCardMini({ cover, event }: { cover: string | null; event: ParisEvent }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: 10, background: "#f9fafb", borderRadius: 16 }}>
      {cover ? (
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: 10, background: "#e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎭</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#111", lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {event.title}
        </p>
        {event.address_name && (
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.address_name}
          </p>
        )}
      </div>
    </div>
  );
}
