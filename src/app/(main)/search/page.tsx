"use client";

import { useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";
import {
  type ParisEvent,
  getEventCover,
  categorizeEvent,
} from "@/lib/paris-opendata";

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ParisEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/events?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.events || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <MobileShell>
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold mb-4">Rechercher</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Exposition, concert, lieu..."
            className="flex-1 px-4 py-3 bg-white border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/50 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E85D3A] text-white px-5 py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? "..." : "OK"}
          </button>
        </form>

        {/* Suggestions */}
        {!searched && (
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {["Exposition", "Concert", "Théâtre", "Conférence", "Gratuit", "Musée", "Atelier"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    // trigger search
                    setLoading(true);
                    setSearched(true);
                    fetch(`/api/events?search=${s}`)
                      .then((r) => r.json())
                      .then((d) => setResults(d.events || []))
                      .finally(() => setLoading(false));
                  }}
                  className="px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 active:scale-95 transition-transform shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {results.length} résultat{results.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#E85D3A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                Aucun résultat pour "{query}"
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((event) => {
                  const cover = getEventCover(event);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${encodeURIComponent(event.id)}`}
                      className="flex bg-white rounded-xl overflow-hidden active:scale-[0.98] transition-transform shadow-sm"
                    >
                      {cover && (
                        <img
                          src={cover}
                          alt=""
                          className="w-20 h-20 object-cover shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 p-2.5 min-w-0">
                        <span className="text-[10px] text-gray-400 uppercase">
                          {categorizeEvent(event.tags, event.qfap_tags)}
                        </span>
                        <h3 className="text-xs font-semibold leading-tight line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                          {event.date_start && <span>{formatDate(event.date_start)}</span>}
                          {event.price_type === "gratuit" && (
                            <span className="text-green-600">Gratuit</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
