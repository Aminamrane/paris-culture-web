"use client";

import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E85D3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">Événement non trouvé</p>
        <button onClick={() => router.back()} className="text-[#E85D3A] text-sm font-medium">
          ← Retour
        </button>
      </div>
    );
  }

  const cover = getEventCover(event);
  const category = categorizeEvent(event.tags, event.qfap_tags);

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto no-scrollbar">
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
                <p className="text-sm">{event.date_description}</p>
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
              <p className="text-sm">{event.price_detail}</p>
            </div>
          )}

          {/* Transport */}
          {event.transport && (
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Transport</p>
              <p className="text-sm">{event.transport}</p>
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
              className="flex-1 bg-[#E85D3A] text-white text-center py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
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
  );
}
