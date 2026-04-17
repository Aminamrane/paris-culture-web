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

  // Pull-to-dismiss state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pullY, setPullY] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current) return;
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) {
      pulling.current = false;
      setPullY(0);
      return;
    }
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    setPullY(dy * 0.5); // dampen
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY > 120) {
      setDismissed(true);
      setTimeout(() => router.back(), 250);
    } else {
      setPullY(0);
    }
  }, [pullY, router]);

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
  const dismissProgress = Math.min(pullY / 120, 1);

  return (
    <>
      {/* Dismiss indicator */}
      {pullY > 0 && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
            display: "flex", justifyContent: "center", paddingTop: Math.min(pullY * 0.3, 40),
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: dismissProgress >= 1 ? "#2563EB" : "rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${0.6 + dismissProgress * 0.4}) rotate(${dismissProgress * 180}deg)`,
              transition: pulling.current ? "none" : "all 0.3s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dismissProgress >= 1 ? "#fff" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 bg-white overflow-y-auto no-scrollbar"
        style={{
          transform: `translateY(${pullY}px) scale(${1 - dismissProgress * 0.05})`,
          borderRadius: pullY > 0 ? `${Math.min(pullY * 0.3, 24)}px` : 0,
          transition: pulling.current ? "none" : "all 0.35s cubic-bezier(0.34,1.3,0.64,1)",
          opacity: dismissed ? 0 : 1,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="fixed top-0 left-0 z-50 w-10 h-10 m-3 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
          style={{ marginTop: "calc(12px + var(--safe-top))" }}
        >
          ←
        </button>

        {/* Cover image */}
        {cover && (
          <div className="w-full aspect-[16/10] relative">
            <img src={cover} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4 pb-20" style={{ paddingBottom: "calc(20px + var(--safe-bottom))" }}>
          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
              {category}
            </span>
            {event.price_type && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  event.price_type === "gratuit"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {getPriceLabel(event.price_type)}
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold leading-tight mb-2">{event.title}</h1>

          {event.lead_text && (
            <p className="text-sm text-gray-600 mb-4">{event.lead_text}</p>
          )}

          {/* Info cards */}
          <div className="space-y-3 mb-4">
            {/* Date */}
            {(event.date_start || event.date_description) && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Date</p>
                {event.date_description ? (
                  <p className="text-sm">{stripHtml(event.date_description)}</p>
                ) : (
                  <p className="text-sm">
                    {formatDateTime(event.date_start)}
                    {event.date_end && (
                      <span className="text-gray-400">
                        {" → "}
                        {formatDateTime(event.date_end)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            {(event.address_name || event.address_street) && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Lieu</p>
                {event.address_name && (
                  <p className="text-sm font-medium">{event.address_name}</p>
                )}
                {event.address_street && (
                  <p className="text-xs text-gray-500">
                    {event.address_street}
                    {event.address_zipcode && `, ${event.address_zipcode}`}
                    {event.address_city && ` ${event.address_city}`}
                  </p>
                )}
              </div>
            )}

            {/* Price */}
            {event.price_detail && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Tarif</p>
                <p className="text-sm">{stripHtml(event.price_detail)}</p>
              </div>
            )}

            {/* Transport */}
            {event.transport && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Transport</p>
                <p className="text-sm">{stripHtml(event.transport)}</p>
              </div>
            )}

            {/* Accessibility */}
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

          {/* Description */}
          {event.description && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {stripHtml(event.description)}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {event.access_link && (
              <a
                href={event.access_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#2563EB] text-white text-center py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Réserver / S'inscrire
              </a>
            )}
            {event.contact_url && (
              <a
                href={event.contact_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
              >
                Site web
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
