"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  type ParisEvent,
  getEventCover,
  categorizeEvent,
  getPriceLabel,
} from "@/lib/paris-opendata";

function formatDateTime(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<ParisEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Pull-to-dismiss
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullYRef = useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/detail?id=${encodeURIComponent(params.id as string)}`);
        const data = await res.json();
        setEvent(data.event || null);
      } catch {
        // error
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  // Pull-to-dismiss with native listeners
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
        <button onClick={goBack} className="text-[#2563EB] text-sm font-medium">
          ← Retour
        </button>
      </div>
    );
  }

  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);
  const progress = Math.min(pullY / 100, 1);

  return (
    <>
      {/* Back button — OUTSIDE scroll container so it always works */}
      <button
        onClick={goBack}
        className="fixed top-0 left-0 z-[100] w-10 h-10 m-3 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
        style={{ marginTop: "calc(12px + var(--safe-top))" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>

      {/* Pull indicator */}
      {pullY > 10 && (
        <div className="fixed top-0 left-0 right-0 z-[90] flex justify-center" style={{ paddingTop: Math.min(pullY * 0.3, 40), pointerEvents: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: progress >= 1 ? "#2563EB" : "rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${0.5 + progress * 0.5})`,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={progress >= 1 ? "#fff" : "#999"} strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="fixed inset-0 z-50 bg-white overflow-y-auto no-scrollbar"
        style={{
          transform: pullY > 0 ? `translateY(${pullY}px)` : undefined,
          borderRadius: pullY > 0 ? `${Math.min(pullY * 0.25, 20)}px` : undefined,
          overscrollBehavior: "none",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.12)" }} />
        </div>

        {/* Cover image */}
        {cover && (
          <div className="w-full aspect-[16/10] relative">
            <img src={cover} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 pb-20" style={{ paddingBottom: "calc(20px + var(--safe-bottom))" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
              {category}
            </span>
            {event.price_type && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${event.price_type === "gratuit" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {getPriceLabel(event.price_type)}
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold leading-tight mb-2">{event.title}</h1>

          {event.lead_text && (
            <p className="text-sm text-gray-600 mb-4">{event.lead_text}</p>
          )}

          <div className="space-y-3 mb-4">
            {(event.date_start || event.date_description) && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Date</p>
                {event.date_description ? (
                  <p className="text-sm">{stripHtml(event.date_description)}</p>
                ) : (
                  <p className="text-sm">
                    {formatDateTime(event.date_start)}
                    {event.date_end && <span className="text-gray-400"> → {formatDateTime(event.date_end)}</span>}
                  </p>
                )}
              </div>
            )}

            {(event.address_name || event.address_street) && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Lieu</p>
                {event.address_name && <p className="text-sm font-medium">{event.address_name}</p>}
                {event.address_street && (
                  <p className="text-xs text-gray-500">
                    {event.address_street}{event.address_zipcode && `, ${event.address_zipcode}`}{event.address_city && ` ${event.address_city}`}
                  </p>
                )}
              </div>
            )}

            {event.price_detail && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Tarif</p>
                <p className="text-sm">{stripHtml(event.price_detail)}</p>
              </div>
            )}

            {event.transport && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Transport</p>
                <p className="text-sm">{stripHtml(event.transport)}</p>
              </div>
            )}

            {(event.pmr || event.blind || event.deaf) && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Accessibilité</p>
                <div className="flex gap-3 text-sm">
                  {event.pmr === 1 && <span>♿ PMR</span>}
                  {event.blind === 1 && <span>👁️ Malvoyant</span>}
                  {event.deaf === 1 && <span>🦻 Malentendant</span>}
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{stripHtml(event.description)}</p>
            </div>
          )}

          <div className="flex gap-2">
            {event.access_link && (
              <a href={event.access_link} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-[#2563EB] text-white text-center py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform">
                Réserver / S'inscrire
              </a>
            )}
            {event.contact_url && (
              <a href={event.contact_url} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform">
                Site web
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
