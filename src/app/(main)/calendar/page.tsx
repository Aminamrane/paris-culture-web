"use client";

import { useEffect, useState, useMemo } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";
import { type ParisEvent, categorizeEvent, getEventCover, getPriceLabel } from "@/lib/paris-opendata";

const CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  expo:        { bg: "#EFF6FF", text: "#2563EB", dot: "#2563EB" },
  theatre:     { bg: "#F3F0FE", text: "#8B5CF6", dot: "#8B5CF6" },
  musique:     { bg: "#EFF6FF", text: "#3B82F6", dot: "#3B82F6" },
  debats:      { bg: "#F0FDF4", text: "#22C55E", dot: "#22C55E" },
  street:      { bg: "#FEFCE8", text: "#EAB308", dot: "#EAB308" },
  litterature: { bg: "#FAF5FF", text: "#A855F7", dot: "#A855F7" },
  immersif:    { bg: "#FDF2F8", text: "#EC4899", dot: "#EC4899" },
  famille:     { bg: "#FFF7ED", text: "#F97316", dot: "#F97316" },
  cinema:      { bg: "#EEF2FF", text: "#6366F1", dot: "#6366F1" },
  autre:       { bg: "#F9FAFB", text: "#6B7280", dot: "#6B7280" },
};

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [events, setEvents] = useState<ParisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  useEffect(() => {
    Promise.all([
      fetch("/api/events?limit=100").then(r => r.json()),
      fetch("/api/events/curation?approved=true").then(r => r.json()),
    ])
      .then(([eventsData, curationData]) => {
        const all: ParisEvent[] = eventsData.events || [];
        const approved = new Set<string>((curationData.items || []).map((r: { externalId: string }) => r.externalId));
        setEvents(approved.size > 0 ? all.filter(e => approved.has(e.id)) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Map events to dates
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ParisEvent[]>();
    for (const e of events) {
      if (!e.date_start) continue;
      const d = new Date(e.date_start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  function getEventsForDay(d: Date) {
    return eventsByDate.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) || [];
  }

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    // Monday-first: getDay() returns 0=Sun, so convert
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(viewYear, viewMonth, i));
    return days;
  }, [viewMonth, viewYear]);

  const selectedEvents = getEventsForDay(selectedDay);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const selectedDateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(selectedDay);

  return (
    <MobileShell>
      <div style={{ paddingBottom: 16 }}>
        {/* Title */}
        <div style={{ padding: "12px 20px 8px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Calendrier</h1>
        </div>

        {/* Calendar card */}
        <div style={{ margin: "0 16px", background: "#fff", borderRadius: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
            <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 12px", marginBottom: 4 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: i >= 5 ? "#2563EB" : "#9ca3af", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 12px 16px", gap: "4px 0" }}>
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />;
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              const dayEvents = getEventsForDay(day);
              const hasDots = dayEvents.length > 0;
              const dotColors = [...new Set(dayEvents.slice(0, 3).map(e => CAT_COLORS[categorizeEvent(e.tags, e.qfap_tags)]?.dot || "#6B7280"))];
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <button key={i} onClick={() => setSelectedDay(day)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    padding: "6px 2px", border: "none", cursor: "pointer", borderRadius: 12,
                    background: isSelected ? "#2563EB" : isToday ? "#EFF6FF" : "transparent",
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 14, fontWeight: isToday || isSelected ? 800 : 500, color: isSelected ? "#fff" : isToday ? "#2563EB" : isWeekend ? "#2563EB" : "#374151" }}>
                    {day.getDate()}
                  </span>
                  {hasDots && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {dotColors.slice(0, 3).map((c, j) => (
                        <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.8)" : c }} />
                      ))}
                    </div>
                  )}
                  {!hasDots && <div style={{ height: 7 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day events */}
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827", textTransform: "capitalize" }}>{selectedDateLabel}</h2>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{selectedEvents.length} événement{selectedEvents.length > 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #2563EB", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : selectedEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", background: "#fff", borderRadius: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Aucun événement ce jour</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedEvents.map(event => {
                const category = categorizeEvent(event.tags, event.qfap_tags);
                const colors = CAT_COLORS[category] || CAT_COLORS.autre;
                const cover = getEventCover(event);
                return (
                  <Link key={event.id} href={`/events/${encodeURIComponent(event.id)}`}
                    style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "block", textDecoration: "none", borderLeft: `4px solid ${colors.dot}` }}>
                    <div style={{ display: "flex", gap: 0 }}>
                      {cover && (
                        <div style={{ width: 88, height: 88, flexShrink: 0 }}>
                          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: colors.text, background: colors.bg, padding: "2px 7px", borderRadius: 20 }}>{category}</span>
                          {event.price_type && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: event.price_type === "gratuit" ? "#16a34a" : "#6b7280", background: event.price_type === "gratuit" ? "#f0fdf4" : "#f9fafb", padding: "2px 7px", borderRadius: 20 }}>{getPriceLabel(event.price_type)}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{event.title}</p>
                        {event.address_name && (
                          <p style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {event.address_name}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </MobileShell>
  );
}
