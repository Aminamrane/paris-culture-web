"use client";

import { useEffect, useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  dateStart: string | null;
  addressName: string | null;
  category: string | null;
  priceType: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/events?limit=100");
        const data = await res.json();
        setEvents(data.events || []);
      } catch {
        // no db
      }
    }
    load();
  }, []);

  // Group by date
  const grouped: Record<string, EventData[]> = {};
  for (const event of events) {
    const key = event.dateStart ? formatDate(event.dateStart) : "Date non précisée";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  return (
    <MobileShell>
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold mb-4">Calendrier</h1>

        {Object.keys(grouped).length === 0 && (
          <p className="text-gray-400 text-center py-20">
            Aucun événement à venir.
          </p>
        )}

        {Object.entries(grouped).map(([date, dayEvents]) => (
          <div key={date} className="mb-5">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 sticky top-0 bg-stone-50 py-1 capitalize">
              {date}
            </h2>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block bg-white p-3 rounded-xl active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{event.title}</span>
                    {event.priceType === "FREE" && (
                      <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                  {event.addressName && (
                    <span className="text-xs text-gray-400">{event.addressName}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
