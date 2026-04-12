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
  localStorage.setItem("lumina_curation", JSON.stringify([...list.filter(r => r.externalId !== rec.externalId), rec]));
}

const CAT_COLORS: Record<string, string> = {
  expo: "#E85D3A", theatre: "#8B5CF6", musique: "#3B82F6", debats: "#22C55E",
  street: "#EAB308", litterature: "#A855F7", immersif: "#EC4899",
  famille: "#F97316", cinema: "#6366F1", autre: "#6B7280",
};

// ─── SwipeCard ────────────────────────────────────────────────────────────────
function SwipeCard({
  event, onDecide, isTop, stackIndex,
}: {
  event: ParisEvent; onDecide: (d: Decision) => void;
  isTop: boolean; stackIndex: number;
}) {
  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);
  const color = CAT_COLORS[category] || "#6B7280";
  const fixed = isFixedVenue(event);

  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const rot = dx / 20;
  const progress = Math.min(Math.abs(dx) / 130, 1);
  const isRight = dx > 0;

  const flyOut = useCallback((dir: "left" | "right") => {
    setFlying(true);
    const tx = dir === "right" ? window.innerWidth * 1.6 : -window.innerWidth * 1.6;
    const ty = Math.abs(dy) * 0.5;
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.38s cubic-bezier(0.4,0,0.8,0.6)";
      cardRef.current.style.transform = `translate(${tx}px, ${ty}px) rotate(${dir === "right" ? 28 : -28}deg)`;
    }
    setTimeout(() => onDecide(dir === "right" ? "approved" : "rejected"), 360);
  }, [dy, onDecide]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    setDragging(true);
    startX.current = e.clientX;
    startY.current = e.clientY;
    cardRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !isTop) return;
    setDx(e.clientX - startX.current);
    setDy(e.clientY - startY.current);
  };
  const onPointerUp = () => {
    if (!dragging || !isTop) return;
    setDragging(false);
    if (dx > 130) flyOut("right");
    else if (dx < -130) flyOut("left");
    else { setDx(0); setDy(0); }
  };

  // Stack appearance for back cards
  const scale = isTop ? 1 : 1 - stackIndex * 0.05;
  const translateY = isTop ? 0 : stackIndex * 14;
  const blur = isTop ? 0 : stackIndex * 1.5;

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10 - stackIndex,
        borderRadius: 28,
        overflow: "hidden",
        background: "#1a1a1a",
        boxShadow: isTop
          ? "0 24px 80px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)"
          : `0 ${8 - stackIndex * 2}px ${24 - stackIndex * 4}px rgba(0,0,0,0.25)`,
        transform: isTop
          ? `translate(${dx}px, ${dy * 0.3}px) rotate(${rot}deg)`
          : `scale(${scale}) translateY(${translateY}px)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        transition: flying ? undefined : dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1), filter 0.3s",
        cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      {/* Cover image — top 62% */}
      <div style={{ height: "62%", position: "relative", overflow: "hidden" }}>
        {cover ? (
          <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${color}33, ${color}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: 0.7 }}>🎭</div>
        )}

        {/* Bottom gradient over image */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />

        {/* Category + type badges */}
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
          <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{category}</span>
          {fixed && <span style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 20 }}>📍 Lieu fixe</span>}
        </div>

        {/* Price top-right */}
        {event.price_type && (
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <span style={{ background: event.price_type === "gratuit" ? "#16a34a" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
              {getPriceLabel(event.price_type)}
            </span>
          </div>
        )}

        {/* LIKE stamp */}
        {isTop && (
          <div style={{
            position: "absolute", top: 22, right: 20,
            border: "3.5px solid #22c55e", borderRadius: 10,
            padding: "6px 14px", transform: "rotate(-15deg)",
            opacity: isRight ? Math.min(progress * 1.5, 1) : 0,
            transition: dragging ? "none" : "opacity 0.15s",
            pointerEvents: "none",
          }}>
            <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>LIKE</span>
          </div>
        )}
        {/* NOPE stamp */}
        {isTop && (
          <div style={{
            position: "absolute", top: 22, left: 20,
            border: "3.5px solid #ef4444", borderRadius: 10,
            padding: "6px 14px", transform: "rotate(15deg)",
            opacity: !isRight ? Math.min(progress * 1.5, 1) : 0,
            transition: dragging ? "none" : "opacity 0.15s",
            pointerEvents: "none",
          }}>
            <span style={{ color: "#ef4444", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>NOPE</span>
          </div>
        )}

        {/* Colour tint overlays */}
        {isTop && (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(34,197,94,0.3)", opacity: isRight ? progress : 0, transition: dragging ? "none" : "opacity 0.15s", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.3)", opacity: !isRight ? progress : 0, transition: dragging ? "none" : "opacity 0.15s", pointerEvents: "none" }} />
          </>
        )}
      </div>

      {/* Info — bottom 38% */}
      <div style={{ height: "38%", padding: "14px 18px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#111" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {event.title}
          </h2>
          {event.lead_text && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {event.lead_text}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          {event.date_start && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {formatDate(event.date_start)}
            </span>
          )}
          {event.address_name && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.address_name}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function CurationPage() {
  const [queue, setQueue] = useState<ParisEvent[]>([]);
  const [all, setAll] = useState<ParisEvent[]>([]);
  const [decisions, setDecisions] = useState<CurationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [lastDecision, setLastDecision] = useState<Decision | null>(null);
  const [mounted, setMounted] = useState(false);

  const approved = decisions.filter(d => d.decision === "approved").length;
  const rejected = decisions.filter(d => d.decision === "rejected").length;
  const total = all.length;
  const progress = total > 0 ? ((approved + rejected) / total) * 100 : 0;

  useEffect(() => {
    setMounted(true);
    const existing = getLocalDecisions();
    setDecisions(existing);
    const seen = new Set(existing.map(r => r.externalId));

    const now = new Date().toISOString().split("T")[0];
    const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=100&where=${encodeURIComponent(`date_end>="${now}" AND lat_lon IS NOT NULL`)}&order_by=${encodeURIComponent("date_start ASC")}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const events: ParisEvent[] = data.results || [];
        setAll(events);
        const pending = events.filter(e => !seen.has(e.id));
        setQueue(pending);
        if (pending.length === 0) setDone(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDecide = useCallback((decision: Decision) => {
    if (queue.length === 0) return;
    const event = queue[0];
    const record: CurationRecord = { externalId: event.id, decision };
    saveDecision(record);
    setDecisions(prev => [...prev.filter(d => d.externalId !== event.id), record]);
    setLastDecision(decision);
    setTimeout(() => setLastDecision(null), 600);

    fetch("/api/events/curation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalId: event.id, approved: decision === "approved", eventData: { id: event.id, title: event.title, coverUrl: getEventCover(event), category: categorizeEvent(event.tags, event.qfap_tags), dateStart: event.date_start, addressName: event.address_name } }),
    }).catch(() => {});

    const next = queue.slice(1);
    setQueue(next);
    if (next.length === 0) setDone(true);
  }, [queue]);

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
    <div style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #0f0f12 0%, #181824 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 10px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/admin" style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", textDecoration: "none", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Curation carte</h1>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
            {total} événements · <span style={{ color: "#22c55e" }}>{approved} ✓</span> · <span style={{ color: "#ef4444" }}>{rejected} ✗</span>
          </p>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
          {queue.length} restants
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ margin: "0 20px", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#E85D3A,#f07a5a)", width: `${progress}%`, transition: "width 0.4s ease" }} />
      </div>

      {/* Keyboard hint */}
      <div style={{ textAlign: "center", padding: "8px 0 0", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 }}>
        ← NOPE &nbsp;·&nbsp; → LIKE &nbsp;·&nbsp; S passer
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 20px 8px", position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,93,58,0.3)", borderTopColor: "#E85D3A", animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Chargement des événements…</p>
          </div>
        ) : done ? (
          <DoneScreen approved={approved} rejected={rejected} onReset={() => { localStorage.removeItem("lumina_curation"); setDecisions([]); setQueue(all); setDone(false); }} />
        ) : (
          <>
            {/* Stack */}
            <div style={{ position: "relative", width: "100%", maxWidth: 420, height: 520 }}>
              {queue.slice(0, 3).map((event, i) => (
                <SwipeCard key={event.id} event={event} onDecide={handleDecide} isTop={i === 0} stackIndex={i} />
              ))}
            </div>

            {/* Decision flash */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              pointerEvents: "none", zIndex: 50,
              opacity: lastDecision ? 1 : 0,
              transition: "opacity 0.15s",
            }}>
              {lastDecision === "approved" && <span style={{ fontSize: 80 }}>💚</span>}
              {lastDecision === "rejected" && <span style={{ fontSize: 80 }}>❌</span>}
              {lastDecision === "skipped" && <span style={{ fontSize: 80 }}>⏭️</span>}
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      {!loading && !done && queue.length > 0 && (
        <div style={{ padding: "4px 40px 44px", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          {/* NOPE */}
          <ActionBtn
            onClick={() => handleDecide("rejected")}
            size={68} borderColor="#fecaca" bg="rgba(239,68,68,0.08)"
            shadow="0 4px 20px rgba(239,68,68,0.2)"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ActionBtn>

          {/* SKIP */}
          <ActionBtn
            onClick={() => handleDecide("skipped")}
            size={50} borderColor="rgba(255,255,255,0.1)" bg="rgba(255,255,255,0.04)"
            shadow="none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.57-4.72" />
            </svg>
          </ActionBtn>

          {/* LIKE */}
          <ActionBtn
            onClick={() => handleDecide("approved")}
            size={68} borderColor="transparent" bg="linear-gradient(135deg,#22c55e,#16a34a)"
            shadow="0 4px 20px rgba(34,197,94,0.35)"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </ActionBtn>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

function ActionBtn({ onClick, size, borderColor, bg, shadow, children }: {
  onClick: () => void; size: number; borderColor: string; bg: string; shadow: string; children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, border: `2px solid ${borderColor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: shadow, cursor: "pointer",
        transform: pressed ? "scale(0.88)" : "scale(1)",
        transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1)",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function DoneScreen({ approved, rejected, onReset }: { approved: number; rejected: number; onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 24px", animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Curation terminée !</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#22c55e" }}>{approved}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Approuvés</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#ef4444" }}>{rejected}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Rejetés</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32, lineHeight: "1.6" }}>
        Les événements approuvés sont maintenant visibles sur la carte.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <Link href="/" style={{ padding: "14px 32px", borderRadius: 16, background: "linear-gradient(135deg,#E85D3A,#f07a5a)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 6px 20px rgba(232,93,58,0.4)" }}>
          Voir la carte →
        </Link>
        <button onClick={onReset} style={{ padding: "12px 24px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
          Recommencer
        </button>
      </div>
    </div>
  );
}
