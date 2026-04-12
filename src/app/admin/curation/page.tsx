"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  type ParisEvent,
  getEventCover,
  categorizeEvent,
  getPriceLabel,
  isFixedVenue,
} from "@/lib/paris-opendata";

// ─── types ────────────────────────────────────────────────────────────────────
type Decision = "approved" | "rejected" | "skipped";
interface CurationRecord { externalId: string; decision: Decision }

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(d));
}

function getLocalDecisions(): CurationRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("lumina_curation") || "[]"); } catch { return []; }
}
function saveDecision(rec: CurationRecord) {
  const list = getLocalDecisions();
  const without = list.filter((r) => r.externalId !== rec.externalId);
  localStorage.setItem("lumina_curation", JSON.stringify([...without, rec]));
}

const CATEGORY_COLORS: Record<string, string> = {
  expo: "#E85D3A", theatre: "#8B5CF6", musique: "#3B82F6", debats: "#22C55E",
  street: "#EAB308", litterature: "#A855F7", immersif: "#EC4899",
  famille: "#F97316", cinema: "#6366F1", autre: "#6B7280",
};

// ─── SwipeCard ────────────────────────────────────────────────────────────────
interface SwipeCardProps {
  event: ParisEvent;
  onDecide: (d: Decision) => void;
  zIndex?: number;
  scale?: number;
  translateY?: number;
}

function SwipeCard({ event, onDecide, zIndex = 0, scale = 1, translateY = 0 }: SwipeCardProps) {
  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);
  const color = CATEGORY_COLORS[category] || "#6B7280";
  const fixed = isFixedVenue(event);

  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTop = zIndex === 10;

  const rotation = offset / 18;
  const overlayOpacity = Math.min(Math.abs(offset) / 120, 1);
  const isRight = offset > 0;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop) return;
      setIsDragging(true);
      startXRef.current = e.clientX;
      cardRef.current?.setPointerCapture(e.pointerId);
    },
    [isTop]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !isTop) return;
      setOffset(e.clientX - startXRef.current);
    },
    [isDragging, isTop]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    if (Math.abs(offset) > 110) {
      // animate out then call onDecide
      const flyX = offset > 0 ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;
      if (cardRef.current) {
        cardRef.current.style.transition = "transform 0.3s cubic-bezier(0.4,0,1,1)";
        cardRef.current.style.transform = `translateX(${flyX}px) rotate(${offset > 0 ? 30 : -30}deg) translateY(${translateY}px) scale(${scale})`;
      }
      setTimeout(() => onDecide(offset > 0 ? "approved" : "rejected"), 280);
    } else {
      // snap back
      setOffset(0);
    }
  }, [isDragging, isTop, offset, onDecide, scale, translateY]);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        transform: isTop
          ? `translateX(${offset}px) rotate(${rotation}deg)`
          : `scale(${scale}) translateY(${translateY}px)`,
        transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: isTop ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
        userSelect: "none",
        borderRadius: 28,
        overflow: "hidden",
        background: "#fff",
        boxShadow: isTop
          ? "0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)"
          : "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      {/* Cover image */}
      <div className="relative" style={{ height: "55%", background: "#f3f4f6" }}>
        {cover ? (
          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}15`, fontSize: 64 }}>
            🎭
          </div>
        )}

        {/* Category pill */}
        <div style={{ position: "absolute", top: 14, left: 14 }}>
          <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, textTransform: "capitalize" }}>
            {category}
          </span>
          {fixed && (
            <span style={{ background: "#1f2937", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, marginLeft: 6 }}>
              Lieu permanent
            </span>
          )}
        </div>

        {/* Price */}
        {event.price_type && (
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <span style={{ background: event.price_type === "gratuit" ? "#22c55e" : "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
              {getPriceLabel(event.price_type)}
            </span>
          </div>
        )}

        {/* Swipe overlays */}
        {isTop && (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(34,197,94,0.35)", opacity: isRight ? overlayOpacity : 0, transition: isDragging ? "none" : "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ border: "4px solid #16a34a", borderRadius: 16, padding: "8px 20px", transform: "rotate(-20deg)" }}>
                <span style={{ color: "#16a34a", fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>✓ OUI</span>
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.35)", opacity: !isRight ? overlayOpacity : 0, transition: isDragging ? "none" : "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ border: "4px solid #dc2626", borderRadius: 16, padding: "8px 20px", transform: "rotate(20deg)" }}>
                <span style={{ color: "#dc2626", fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>✕ NON</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 20px" }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.25, marginBottom: 6, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
          {event.title}
        </h2>
        {event.lead_text && (
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 10, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
            {event.lead_text}
          </p>
        )}
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af" }}>
          {event.date_start && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {formatDate(event.date_start)}
            </div>
          )}
          {event.address_name && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.address_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CurationPage() {
  const [events, setEvents] = useState<ParisEvent[]>([]);
  const [queue, setQueue] = useState<ParisEvent[]>([]);
  const [decisions, setDecisions] = useState<CurationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const approvedCount = decisions.filter((d) => d.decision === "approved").length;
  const rejectedCount = decisions.filter((d) => d.decision === "rejected").length;

  useEffect(() => {
    const existing = getLocalDecisions();
    setDecisions(existing);
    const existingIds = new Set(existing.map((r) => r.externalId));

    const now = new Date().toISOString().split("T")[0];
    const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=100&where=${encodeURIComponent(`date_end>="${now}" AND lat_lon IS NOT NULL`)}&order_by=${encodeURIComponent("date_start ASC")}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const all: ParisEvent[] = data.results || [];
        const pending = all.filter((e) => !existingIds.has(e.id));
        setEvents(all);
        setQueue(pending);
        if (pending.length === 0) setDone(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDecide = useCallback(
    (decision: Decision) => {
      if (queue.length === 0) return;
      const event = queue[0];
      const record: CurationRecord = { externalId: event.id, decision };
      saveDecision(record);
      setDecisions((prev) => [...prev.filter((d) => d.externalId !== event.id), record]);

      // Persist to API (fire-and-forget)
      fetch("/api/events/curation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: event.id,
          approved: decision === "approved",
          eventData: {
            id: event.id, title: event.title,
            coverUrl: getEventCover(event),
            category: categorizeEvent(event.tags, event.qfap_tags),
            dateStart: event.date_start, addressName: event.address_name,
          },
        }),
      }).catch(() => {});

      const next = queue.slice(1);
      setQueue(next);
      if (next.length === 0) setDone(true);
    },
    [queue]
  );

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleDecide("approved");
      else if (e.key === "ArrowLeft") handleDecide("rejected");
      else if (e.key === "s" || e.key === "S") handleDecide("skipped");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDecide]);

  return (
    <div style={{ minHeight: "100dvh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", background: "#fff", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/admin" style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>Curation de la carte</h1>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
            {events.length} événements · {approvedCount} approuvés · {rejectedCount} rejetés
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#f3f4f6", overflow: "hidden", marginLeft: 8 }}>
          {events.length > 0 && (
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#E85D3A,#f07a5a)",
                borderRadius: 2,
                width: `${((approvedCount + rejectedCount) / events.length) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div style={{ textAlign: "center", padding: "8px 0 0", fontSize: 11, color: "#d1d5db" }}>
        ← Rejeter &nbsp;·&nbsp; → Approuver &nbsp;·&nbsp; S Passer
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E85D3A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Chargement des événements…</p>
          </div>
        ) : done ? (
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Curation terminée !</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>
              <strong style={{ color: "#16a34a" }}>{approvedCount} approuvés</strong> &nbsp;·&nbsp;
              <strong style={{ color: "#dc2626" }}>{rejectedCount} rejetés</strong>
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>
              Revenez demain pour de nouveaux événements.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("lumina_curation");
                setDecisions([]);
                const pending = events.filter(() => true); // reset
                setQueue(events);
                setDone(false);
              }}
              style={{ padding: "12px 24px", borderRadius: 14, background: "#f3f4f6", fontSize: 13, fontWeight: 600, color: "#374151", border: "none", cursor: "pointer" }}
            >
              Recommencer
            </button>
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", maxWidth: 400, height: 520 }}>
            {/* Card stack (show top 3) */}
            {queue.slice(0, 3).map((event, i) => (
              <SwipeCard
                key={event.id}
                event={event}
                onDecide={handleDecide}
                zIndex={10 - i}
                scale={1 - i * 0.04}
                translateY={i * 10}
              />
            ))}

            {/* Remaining count */}
            {queue.length > 3 && (
              <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#d1d5db", whiteSpace: "nowrap" }}>
                +{queue.length - 3} événements restants
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!loading && !done && queue.length > 0 && (
        <div style={{ padding: "0 40px 32px", display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          {/* Reject */}
          <button
            onClick={() => handleDecide("rejected")}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#fff", border: "2.5px solid #fecaca",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(239,68,68,0.15)",
              cursor: "pointer", transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Skip */}
          <button
            onClick={() => handleDecide("skipped")}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#f9fafb", border: "2px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Passer (S)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.57-4.72" />
            </svg>
          </button>

          {/* Approve */}
          <button
            onClick={() => handleDecide("approved")}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg,#E85D3A,#f07a5a)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(232,93,58,0.35)",
              cursor: "pointer", transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
